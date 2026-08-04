import { AppShell } from "@/features/shell/app-shell";
import { MockSessionProvider } from "@/features/shell/mock-session";
import { currentIdentity } from "@/modules/identity/application/current-identity";
import { memberAiProducts } from "@/server/ai/member-ai-access";
import { environment } from "@/server/config/environment";

export const dynamic = "force-dynamic";

export default async function MemberLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const config = environment();
  const authEnabled = config.FEATURE_AUTH;
  const identity = authEnabled ? await currentIdentity() : null;
  let aiAccess: "available" | "expired" | "locked" = "locked";
  if (config.FEATURE_VUELVE_IA && identity) {
    const access = await memberAiProducts(identity.id);
    aiAccess = access.hasAi ? "available" : access.hadAi ? "expired" : "locked";
  }
  return (
    <MockSessionProvider
      aiAccessLocked={authEnabled}
      initialAiAccess={
        config.FEATURE_VUELVE_IA
          ? aiAccess
          : config.MEMBER_APP_MODE === "production"
            ? "locked"
            : "available"
      }
      initialRole={identity?.role ?? "member"}
      roleLocked={authEnabled}
    >
      <AppShell authEnabled={authEnabled}>{children}</AppShell>
    </MockSessionProvider>
  );
}
