import { AppShell } from "@/features/shell/app-shell";
import { MockSessionProvider } from "@/features/shell/mock-session";
import { currentIdentity } from "@/modules/identity/application/current-identity";
import { environment } from "@/server/config/environment";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

export const dynamic = "force-dynamic";

export default async function MemberLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const config = environment();
  const authEnabled = config.FEATURE_AUTH;
  const identity = authEnabled ? await currentIdentity() : null;
  let aiAccess: "available" | "locked" = "locked";
  if (config.FEATURE_VUELVE_IA && identity) {
    const client = await createSupabaseServerClient();
    const { data } = await client
      .from("effective_entitlements")
      .select("product_code")
      .eq("member_id", identity.id)
      .eq("product_code", "vuelve_ia")
      .maybeSingle();
    aiAccess = data ? "available" : "locked";
  }
  return (
    <MockSessionProvider
      aiAccessLocked={config.FEATURE_VUELVE_IA}
      initialAiAccess={
        config.FEATURE_VUELVE_IA ? aiAccess : "available"
      }
      initialRole={identity?.role ?? "member"}
      roleLocked={authEnabled}
    >
      <AppShell authEnabled={authEnabled}>{children}</AppShell>
    </MockSessionProvider>
  );
}
