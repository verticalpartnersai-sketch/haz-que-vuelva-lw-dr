import { NextResponse } from "next/server";

import { perfectPayPayloadSchema } from "@/modules/payments/adapters/perfect-pay-schema";
import {
  normalizePerfectPayPayload,
  secureTokenMatches,
} from "@/modules/payments/adapters/perfect-pay-normalizer";
import { SupabasePaymentIngress } from "@/modules/payments/adapters/supabase-payment-ingress";
import { processPaymentEvent } from "@/modules/payments/application/process-payment-event";
import { environment } from "@/server/config/environment";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 64 * 1024;

function requestIsTooLarge(request: Request) {
  const length = Number(request.headers.get("content-length") ?? "0");
  return Number.isFinite(length) && length > MAX_BODY_BYTES;
}

export async function POST(request: Request) {
  const config = environment();
  if (!config.FEATURE_PAYMENTS) {
    return NextResponse.json({ accepted: false }, { status: 503 });
  }
  if (requestIsTooLarge(request)) {
    return NextResponse.json({ accepted: false }, { status: 413 });
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json({ accepted: false }, { status: 413 });
  }

  let input: unknown;
  try {
    input = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ accepted: false }, { status: 400 });
  }

  const parsed = perfectPayPayloadSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ accepted: false }, { status: 400 });
  }
  if (
    !config.PERFECT_PAY_WEBHOOK_TOKEN ||
    !secureTokenMatches(parsed.data.token, config.PERFECT_PAY_WEBHOOK_TOKEN)
  ) {
    return NextResponse.json({ accepted: false }, { status: 401 });
  }

  let event: ReturnType<typeof normalizePerfectPayPayload>;
  try {
    event = normalizePerfectPayPayload(parsed.data);
  } catch {
    return NextResponse.json({ accepted: false }, { status: 400 });
  }
  const ingress = new SupabasePaymentIngress(createSupabaseServiceClient());
  await processPaymentEvent(event, { events: ingress, queue: ingress });

  return NextResponse.json({ accepted: true }, { status: 202 });
}
