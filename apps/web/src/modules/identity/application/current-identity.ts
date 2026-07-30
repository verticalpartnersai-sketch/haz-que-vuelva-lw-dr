import "server-only";

import { cache } from "react";

import { createSupabaseServerClient } from "@/server/supabase/server-client";

export type CurrentIdentity = {
  id: string;
  email: string;
  displayName: string | null;
  role: "member" | "admin";
};

export class AuthenticationRequiredError extends Error {}
export class ProfileUnavailableError extends Error {}

export const currentIdentity = cache(async (): Promise<CurrentIdentity> => {
  const client = await createSupabaseServerClient();
  const { data: claimsData, error: claimsError } = await client.auth.getClaims();
  const subject = claimsData?.claims?.sub;
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

  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.display_name,
    role: profile.role,
  };
});

export async function requireAdmin() {
  const identity = await currentIdentity();
  if (identity.role !== "admin") {
    throw new AuthenticationRequiredError("Admin role required");
  }
  return identity;
}
