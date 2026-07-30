import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { PasswordVerifier } from "../application/admin-reauthentication.ts";

export class SupabasePasswordVerifier implements PasswordVerifier {
  constructor(
    private readonly publishableKey: string,
    private readonly url: string,
  ) {}

  async verify(email: string, password: string) {
    const client = createClient(this.url, this.publishableKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    return !error && data.user?.email?.toLowerCase() === email.toLowerCase();
  }
}
