import { NextResponse } from "next/server";

import { SupabaseEmailDeliveryRecorder } from "@/modules/notifications/adapters/supabase-email-delivery-recorder";
import { ResendWebhookVerifier } from "@/modules/notifications/adapters/resend-webhook-verifier";
import {
  resendDeliveryEventSchema,
  resendEventDetail,
} from "@/modules/notifications/domain/resend-delivery-event";
import { environment } from "@/server/config/environment";
import { readBoundedTextBody } from "@/server/http/read-bounded-text-body";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 64 * 1024;

function webhookHeaders(request: Request) {
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  return id && timestamp && signature ? { id, signature, timestamp } : null;
}

export async function POST(request: Request) {
  const config = environment();
  if (!config.RESEND_WEBHOOK_SECRET || !config.SUPABASE_SECRET_KEY) {
    return NextResponse.json({ accepted: false }, { status: 503 });
  }

  const headers = webhookHeaders(request);
  if (!headers) {
    return NextResponse.json({ accepted: false }, { status: 400 });
  }

  const body = await readBoundedTextBody(request, MAX_BODY_BYTES);
  if (!body.ok) {
    return NextResponse.json(
      { accepted: false },
      { status: body.reason === "too_large" ? 413 : 400 },
    );
  }

  let verifiedPayload: unknown;
  try {
    verifiedPayload = new ResendWebhookVerifier(
      config.RESEND_WEBHOOK_SECRET,
    ).verify(body.value, headers);
  } catch {
    return NextResponse.json({ accepted: false }, { status: 401 });
  }

  const parsed = resendDeliveryEventSchema.safeParse(verifiedPayload);
  if (!parsed.success) {
    return new NextResponse(null, { status: 204 });
  }

  const recorder = new SupabaseEmailDeliveryRecorder(
    createSupabaseServiceClient(),
  );
  let recorded = 0;
  for (const recipient of parsed.data.data.to) {
    if (
      await recorder.record({
        detailCode: resendEventDetail(parsed.data),
        event: parsed.data,
        providerEventId: headers.id,
        recipient,
      })
    ) {
      recorded += 1;
    }
  }

  return NextResponse.json({ accepted: true, recorded });
}
