import type { NextRequest } from "next/server";

export function isSameOriginMutation(
  request: NextRequest,
  configuredAppUrl?: string,
) {
  const expectedOrigin = configuredAppUrl
    ? new URL(configuredAppUrl).origin
    : request.nextUrl.origin;
  return request.headers.get("origin") === expectedOrigin;
}
