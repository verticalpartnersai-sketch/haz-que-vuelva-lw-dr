import "server-only";

import { createClient } from "@supabase/supabase-js";

import { environment } from "@/server/config/environment";

export function createSupabaseServiceClient() {
  const config = environment();
  if (!config.NEXT_PUBLIC_SUPABASE_URL || !config.SUPABASE_SECRET_KEY) {
    throw new Error("Supabase service configuration is unavailable");
  }

  return createClient(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.SUPABASE_SECRET_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
