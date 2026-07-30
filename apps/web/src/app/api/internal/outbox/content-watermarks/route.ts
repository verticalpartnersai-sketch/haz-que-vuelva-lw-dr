import { createHash, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { PdfLibWatermarkRenderer } from "@/modules/content/adapters/pdf-lib-watermark-renderer";
import { SupabaseContentWatermarkJobs } from "@/modules/content/adapters/supabase-content-watermark-jobs";
import { runContentWatermarkWorker } from "@/modules/content/application/run-content-watermark-worker";
import { environment } from "@/server/config/environment";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

function matches(received: string, expected: string) {
  return timingSafeEqual(
    createHash("sha256").update(received).digest(),
    createHash("sha256").update(expected).digest(),
  );
}

export async function POST(request: Request) {
  const config = environment();
  const supplied = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (
    !config.FEATURE_CONTENT ||
    !supplied ||
    !config.WORKER_INTERNAL_SECRET ||
    !matches(supplied, config.WORKER_INTERNAL_SECRET)
  ) {
    return NextResponse.json({ accepted: false }, { status: 401 });
  }
  if (!config.NEXT_PUBLIC_SUPABASE_URL || !config.SUPABASE_SECRET_KEY) {
    return NextResponse.json({ accepted: false }, { status: 503 });
  }

  const result = await runContentWatermarkWorker({
    jobs: new SupabaseContentWatermarkJobs(createSupabaseServiceClient()),
    limit: 1,
    renderer: new PdfLibWatermarkRenderer(),
  });
  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
