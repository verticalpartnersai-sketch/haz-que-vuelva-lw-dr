import { createHash } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ContentWatermarkJob,
  ContentWatermarkJobs,
} from "../application/run-content-watermark-worker.ts";
import {
  MAX_SOURCE_PDF_BYTES,
  PermanentWatermarkError,
} from "../application/run-content-watermark-worker.ts";

const JOB_TYPE = "generate_content_watermark";
const OUTPUT_BUCKET = "member-sensitive";

function requiredPayload(job: ContentWatermarkJob) {
  const memberId = job.payload.member_id;
  const sourceFileId = job.payload.source_file_id;
  if (!memberId || !sourceFileId) throw new Error("invalid_watermark_job");
  return { memberId, sourceFileId };
}

function outputPath(job: ContentWatermarkJob) {
  const { memberId, sourceFileId } = requiredPayload(job);
  return `watermarked/${memberId}/${sourceFileId}.pdf`;
}

export class SupabaseContentWatermarkJobs implements ContentWatermarkJobs {
  constructor(private readonly client: SupabaseClient) {}

  async claim(limit: number): Promise<ContentWatermarkJob[]> {
    const { data, error } = await this.client.rpc("claim_outbox_jobs", {
      p_job_type: JOB_TYPE,
      p_limit: limit,
    });
    if (error) throw new Error(`watermark_claim_failed:${error.code}`);
    return (data ?? []) as ContentWatermarkJob[];
  }

  async artifactExists(job: ContentWatermarkJob) {
    const { memberId, sourceFileId } = requiredPayload(job);
    const { data, error } = await this.client
      .from("watermarked_files")
      .select("id")
      .eq("source_file_id", sourceFileId)
      .eq("member_id", memberId)
      .maybeSingle();
    if (error) throw new Error(`watermark_lookup_failed:${error.code}`);
    return Boolean(data);
  }

  async loadSource(job: ContentWatermarkJob) {
    const { sourceFileId } = requiredPayload(job);
    const { data: source, error } = await this.client
      .from("content_files")
      .select("storage_bucket,storage_path,mime_type,size_bytes")
      .eq("id", sourceFileId)
      .single();
    if (error || !source) throw new Error("watermark_source_unavailable");
    const sizeBytes = Number(source.size_bytes);
    if (
      !Number.isFinite(sizeBytes) ||
      sizeBytes <= 0 ||
      sizeBytes > MAX_SOURCE_PDF_BYTES
    ) {
      throw new PermanentWatermarkError("source_pdf_size_out_of_bounds");
    }

    const { data: file, error: downloadError } = await this.client.storage
      .from(source.storage_bucket)
      .download(source.storage_path);
    if (downloadError || !file) {
      throw new Error("watermark_source_download_failed");
    }

    return {
      bytes: new Uint8Array(await file.arrayBuffer()),
      mimeType: source.mime_type,
      sizeBytes,
    };
  }

  async auditMarker(job: ContentWatermarkJob) {
    const { memberId, sourceFileId } = requiredPayload(job);
    return createHash("sha256")
      .update(`${JOB_TYPE}:${job.id}:${memberId}:${sourceFileId}`)
      .digest("hex")
      .slice(0, 24);
  }

  async saveArtifact(
    job: ContentWatermarkJob,
    bytes: Uint8Array,
    auditMarker: string,
  ) {
    const { memberId, sourceFileId } = requiredPayload(job);
    const storagePath = outputPath(job);
    const body = bytes.slice().buffer as ArrayBuffer;
    const { error: uploadError } = await this.client.storage
      .from(OUTPUT_BUCKET)
      .upload(storagePath, body, {
        cacheControl: "0",
        contentType: "application/pdf",
        upsert: true,
      });
    if (uploadError) {
      throw new Error(`watermark_upload_failed:${uploadError.name}`);
    }

    const { error } = await this.client.from("watermarked_files").upsert(
      {
        audit_marker: auditMarker,
        member_id: memberId,
        source_file_id: sourceFileId,
        storage_bucket: OUTPUT_BUCKET,
        storage_path: storagePath,
      },
      { onConflict: "source_file_id,member_id" },
    );
    if (error) throw new Error(`watermark_persist_failed:${error.code}`);
  }

  async complete(job: ContentWatermarkJob) {
    const { error } = await this.client
      .from("outbox_jobs")
      .update({
        completed_at: new Date().toISOString(),
        last_error: null,
        locked_at: null,
      })
      .eq("id", job.id);
    if (error) throw new Error(`watermark_completion_failed:${error.code}`);
  }

  async retry(job: ContentWatermarkJob, errorCode: string) {
    const terminal = job.attempts >= 8;
    const delayMinutes = Math.min(2 ** job.attempts, 360);
    const { error } = await this.client
      .from("outbox_jobs")
      .update({
        available_at: new Date(Date.now() + delayMinutes * 60_000).toISOString(),
        failed_at: terminal ? new Date().toISOString() : null,
        last_error: errorCode.slice(0, 160),
        locked_at: null,
      })
      .eq("id", job.id);
    if (error) throw new Error(`watermark_retry_failed:${error.code}`);
  }

  async fail(job: ContentWatermarkJob, errorCode: string) {
    const { error } = await this.client
      .from("outbox_jobs")
      .update({
        failed_at: new Date().toISOString(),
        last_error: errorCode.slice(0, 160),
        locked_at: null,
      })
      .eq("id", job.id);
    if (error) throw new Error(`watermark_failure_failed:${error.code}`);
  }
}
