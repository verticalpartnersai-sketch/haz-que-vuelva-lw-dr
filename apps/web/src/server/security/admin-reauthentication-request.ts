import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_REAUTH_COOKIE,
  AdminReauthenticationError,
  AdminReauthenticationRequiredError,
  hashAdminReauthenticationToken,
} from "@/modules/identity/application/admin-reauthentication";

export class MissingAdminReauthenticationError extends Error {}

export function isAdminReauthenticationRequired(error: unknown) {
  return (
    error instanceof MissingAdminReauthenticationError ||
    error instanceof AdminReauthenticationRequiredError
  );
}

export async function adminReauthenticationHash(request: NextRequest) {
  try {
    return await hashAdminReauthenticationToken(
      request.cookies.get(ADMIN_REAUTH_COOKIE)?.value ?? "",
    );
  } catch (error) {
    if (error instanceof AdminReauthenticationError) {
      throw new MissingAdminReauthenticationError(
        "admin_reauthentication_required",
      );
    }
    throw error;
  }
}

export function clearAdminReauthentication(
  response: NextResponse,
  request: NextRequest,
) {
  response.cookies.set(ADMIN_REAUTH_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/api/admin",
    sameSite: "strict",
    secure: request.nextUrl.protocol === "https:",
  });
  return response;
}

export function adminReauthenticationRequired(request: NextRequest) {
  return clearAdminReauthentication(
    NextResponse.json(
      { code: "admin_reauthentication_required" },
      { status: 428 },
    ),
    request,
  );
}
