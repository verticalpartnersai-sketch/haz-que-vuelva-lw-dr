export const MAX_SOURCE_PDF_BYTES = 12 * 1024 * 1024;
export const MAX_WATERMARKED_PDF_BYTES = 24 * 1024 * 1024;
export const MAX_SOURCE_PDF_PAGES = 300;

export type ContentWatermarkJob = {
  id: string;
  attempts: number;
  payload: {
    member_id?: string;
    source_file_id?: string;
  };
};

export type SourcePdf = {
  bytes: Uint8Array;
  mimeType: string;
  sizeBytes: number;
};

export type WatermarkRenderInput = {
  auditMarker: string;
  bytes: Uint8Array;
  maxPages: number;
};

export interface ContentWatermarkJobs {
  claim(limit: number): Promise<ContentWatermarkJob[]>;
  artifactExists(job: ContentWatermarkJob): Promise<boolean>;
  loadSource(job: ContentWatermarkJob): Promise<SourcePdf>;
  auditMarker(job: ContentWatermarkJob): Promise<string>;
  saveArtifact(
    job: ContentWatermarkJob,
    bytes: Uint8Array,
    auditMarker: string,
  ): Promise<void>;
  complete(job: ContentWatermarkJob): Promise<void>;
  retry(job: ContentWatermarkJob, errorCode: string): Promise<void>;
  fail(job: ContentWatermarkJob, errorCode: string): Promise<void>;
}

export interface PdfWatermarkRenderer {
  render(input: WatermarkRenderInput): Promise<Uint8Array>;
}

export class PermanentWatermarkError extends Error {}

function assertJobPayload(job: ContentWatermarkJob) {
  if (!job.payload.member_id) {
    throw new PermanentWatermarkError("missing_member_id");
  }
  if (!job.payload.source_file_id) {
    throw new PermanentWatermarkError("missing_source_file_id");
  }
}

function assertSource(source: SourcePdf) {
  if (source.mimeType.toLowerCase() !== "application/pdf") {
    throw new PermanentWatermarkError("unsupported_source_mime_type");
  }
  if (
    source.sizeBytes <= 0 ||
    source.sizeBytes > MAX_SOURCE_PDF_BYTES ||
    source.bytes.byteLength > MAX_SOURCE_PDF_BYTES
  ) {
    throw new PermanentWatermarkError("source_pdf_size_out_of_bounds");
  }
}

function errorCode(error: unknown) {
  return error instanceof Error ? error.message : "unknown_watermark_error";
}

export async function runContentWatermarkWorker(dependencies: {
  jobs: ContentWatermarkJobs;
  renderer: PdfWatermarkRenderer;
  limit?: number;
}) {
  const jobs = await dependencies.jobs.claim(
    Math.min(Math.max(dependencies.limit ?? 1, 1), 2),
  );
  let completed = 0;
  let failed = 0;
  let retried = 0;

  for (const job of jobs) {
    try {
      assertJobPayload(job);
      if (await dependencies.jobs.artifactExists(job)) {
        await dependencies.jobs.complete(job);
        completed += 1;
        continue;
      }

      const source = await dependencies.jobs.loadSource(job);
      assertSource(source);
      const auditMarker = await dependencies.jobs.auditMarker(job);
      const output = await dependencies.renderer.render({
        auditMarker,
        bytes: source.bytes,
        maxPages: MAX_SOURCE_PDF_PAGES,
      });
      if (
        output.byteLength <= 0 ||
        output.byteLength > MAX_WATERMARKED_PDF_BYTES
      ) {
        throw new PermanentWatermarkError(
          "watermarked_pdf_size_out_of_bounds",
        );
      }

      await dependencies.jobs.saveArtifact(job, output, auditMarker);
      await dependencies.jobs.complete(job);
      completed += 1;
    } catch (error) {
      const code = errorCode(error);
      if (error instanceof PermanentWatermarkError) {
        await dependencies.jobs.fail(job, code);
        failed += 1;
      } else {
        await dependencies.jobs.retry(job, code);
        retried += 1;
      }
    }
  }

  return { claimed: jobs.length, completed, failed, retried };
}
