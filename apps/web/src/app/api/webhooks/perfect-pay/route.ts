import { NextResponse } from "next/server";

import { perfectPayPayloadSchema } from "@/modules/payments/adapters/perfect-pay-schema";
import {
  normalizePerfectPayPayloads,
  secureTokenMatches,
} from "@/modules/payments/adapters/perfect-pay-normalizer";
import { SupabasePaymentIngress } from "@/modules/payments/adapters/supabase-payment-ingress";
import { processPaymentEvent } from "@/modules/payments/application/process-payment-event";
import { environment } from "@/server/config/environment";
import { readBoundedJsonBody } from "@/server/http/read-bounded-json-body";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 64 * 1024;
const AUTH_PROBE_HEADER = "x-hqv-auth-probe";

export async function POST(request: Request) {
  const config = environment();
  if (!config.FEATURE_PAYMENTS) {
    return NextResponse.json({ accepted: false }, { status: 503 });
  }
  const body = await readBoundedJsonBody(request, MAX_BODY_BYTES);
  if (!body.ok) {
    return NextResponse.json(
      { accepted: false },
      { status: body.reason === "too_large" ? 413 : 400 },
    );
  }

  const parsed = perfectPayPayloadSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ accepted: false }, { status: 400 });
  }
  if (
    !config.PERFECT_PAY_WEBHOOK_TOKEN ||
    !secureTokenMatches(parsed.data.token, config.PERFECT_PAY_WEBHOOK_TOKEN)
  ) {
    return NextResponse.json({ accepted: false }, { status: 401 });
  }
  if (request.headers.get(AUTH_PROBE_HEADER) === "1") {
    return new NextResponse(null, { status: 204 });
  }

  let events: ReturnType<typeof normalizePerfectPayPayloads>;
  try {
    events = normalizePerfectPayPayloads(parsed.data);
  } catch {
    return NextResponse.json({ accepted: false }, { status: 400 });
  }
  const ingress = new SupabasePaymentIngress(createSupabaseServiceClient());
  for (const event of events) {
    await processPaymentEvent(event, { events: ingress, queue: ingress });
  }

  return NextResponse.json(
    { accepted: true, lineItems: events.length },
    { status: 202 },
  );
}
