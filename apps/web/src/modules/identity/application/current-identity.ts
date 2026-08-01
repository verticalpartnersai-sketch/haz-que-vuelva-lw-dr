import "server-only";

import { cache } from "react";

import { createSupabaseServerClient } from "@/server/supabase/server-client";

export type CurrentIdentity = {
  id: string;
  email: string;
  displayName: string | null;
  role: "member" | "admin";
  assuranceLevel: "aal1" | "aal2";
};

export class AuthenticationRequiredError extends Error {}
export class ProfileUnavailableError extends Error {}

export const currentIdentity = cache(async (): Promise<CurrentIdentity> => {
  const client = await createSupabaseServerClient();
  const { data: claimsData, error: claimsError } = await client.auth.getClaims();
  const claims = claimsData?.claims;
  const subject = claims?.sub;
  const assuranceLevel = claims?.aal === "aal2" ? "aal2" : "aal1";
  if (claimsError || typeof subject !== "string") {
    throw new AuthenticationRequiredError("Authentication required");
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("id,email,display_name,role")
    .eq("id", subject)
    .single();
  if (profileError || !profile) {
    throw new ProfileUnavailableError("Authenticated profile is unavailable");
  }

  let role: CurrentIdentity["role"] = "member";
  if (profile.role === "admin") {
    const { data: isAuthorizedAdmin, error: adminError } =
      await client.rpc("is_admin");
    if (adminError) {
      throw new ProfileUnavailableError("Admin authorization is unavailable");
    }
    role = isAuthorizedAdmin === true ? "admin" : "member";
  }

  return {
    assuranceLevel,
    id: profile.id,
    email: profile.email,
    displayName: profile.display_name,
    role,
  };
});

export async function requireAdmin() {
  const identity = await currentIdentity();
  if (identity.role !== "admin") {
    throw new AuthenticationRequiredError("Admin role required");
  }
  return identity;
}
