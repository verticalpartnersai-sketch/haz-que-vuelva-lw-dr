const ADMIN_REAUTH_TOKEN_BYTES = 32;

export const ADMIN_REAUTH_COOKIE = "hqv_admin_reauth";
export const ADMIN_REAUTH_TTL_SECONDS = 5 * 60;

export class AdminReauthenticationError extends Error {}
export class AdminReauthenticationRequiredError extends Error {}

export interface PasswordVerifier {
  verify(email: string, password: string): Promise<boolean>;
}

export function createAdminReauthenticationToken() {
  const bytes = crypto.getRandomValues(
    new Uint8Array(ADMIN_REAUTH_TOKEN_BYTES),
  );
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export function isAdminReauthenticationToken(value: string) {
  return /^[A-Za-z0-9_-]{43}$/.test(value);
}

export async function hashAdminReauthenticationToken(token: string) {
  if (!isAdminReauthenticationToken(token)) {
    throw new AdminReauthenticationError("invalid_admin_reauth_token");
  }
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function verifyAdminPassword({
  email,
  password,
  verifier,
}: {
  email: string;
  password: string;
  verifier: PasswordVerifier;
}) {
  if (password.length < 1 || password.length > 256) {
    throw new AdminReauthenticationError("invalid_admin_password");
  }
  if (!(await verifier.verify(email, password))) {
    throw new AdminReauthenticationError("admin_reauthentication_failed");
  }
}
