import { createHash, timingSafeEqual } from "node:crypto";

export function hasValidInternalCredential(
  request: Request,
  expected: string | undefined,
) {
  const received = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (!received || !expected) return false;
  return timingSafeEqual(
    createHash("sha256").update(received).digest(),
    createHash("sha256").update(expected).digest(),
  );
}
