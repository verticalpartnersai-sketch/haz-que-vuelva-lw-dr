import { createClient } from "@supabase/supabase-js";

const email = process.argv[2]?.trim().toLowerCase();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

if (!email || !url || !secret) {
  console.error(
    "Usage: npm run admin:promote -- admin@example.com (with Supabase env configured)",
  );
  process.exit(1);
}

const client = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { data, error } = await client
  .rpc("promote_admin_by_email", { p_email: email });

if (error || !data) {
  console.error(`Admin promotion failed: ${error?.code ?? "profile_not_found"}`);
  process.exit(1);
}

console.log(`Admin promotion completed for profile ${data}`);
