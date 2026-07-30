import { AdminReauthenticationRequiredError } from "../../identity/application/admin-reauthentication.ts";

export function requireReauthenticationTokenHash(value: string) {
  if (!/^[0-9a-f]{64}$/.test(value)) {
    throw new AdminReauthenticationRequiredError(
      "admin_reauthentication_required",
    );
  }
  return value;
}

export function throwIfAdminReauthenticationError(
  error: { code?: string } | null,
) {
  if (error?.code === "42501") {
    throw new AdminReauthenticationRequiredError(
      "admin_reauthentication_required",
    );
  }
}
