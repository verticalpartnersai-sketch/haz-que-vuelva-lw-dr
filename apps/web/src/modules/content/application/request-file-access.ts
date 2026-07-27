import type { SupabaseClient } from "@supabase/supabase-js";

export class ContentAccessDeniedError extends Error {}
export class ContentFileNotFoundError extends Error {}
export class WatermarkedFilePendingError extends Error {}

export async function requestFileAccess(input: {
  client: SupabaseClient;
  fileId: string;
  memberId: string;
  expiresInSeconds?: number;
}) {
  const expiresIn = Math.min(Math.max(input.expiresInSeconds ?? 120, 30), 300);
  const { data: file, error } = await input.client
    .from("content_files")
    .select(
      "id,storage_bucket,storage_path,content_items!inner(product_code,active)",
    )
    .eq("id", input.fileId)
    .single();
  if (error || !file) throw new ContentFileNotFoundError();

  const content = Array.isArray(file.content_items)
    ? file.content_items[0]
    : file.content_items;
  if (!content?.active) throw new ContentAccessDeniedError();

  const { data: entitlement } = await input.client
    .from("effective_entitlements")
    .select("product_code")
    .eq("member_id", input.memberId)
    .eq("product_code", content.product_code)
    .maybeSingle();
  if (!entitlement) throw new ContentAccessDeniedError();

  const { data: artifact, error: artifactError } = await input.client
    .from("watermarked_files")
    .select("storage_bucket,storage_path,audit_marker")
    .eq("source_file_id", file.id)
    .eq("member_id", input.memberId)
    .maybeSingle();
  if (artifactError) throw new ContentAccessDeniedError();
  if (!artifact) throw new WatermarkedFilePendingError();

  const { data: signed, error: signingError } = await input.client.storage
    .from(artifact.storage_bucket)
    .createSignedUrl(artifact.storage_path, expiresIn);
  if (signingError || !signed) throw new ContentAccessDeniedError();

  const { error: auditError } = await input.client.from("download_events").insert({
    member_id: input.memberId,
    source_file_id: file.id,
    audit_marker: artifact.audit_marker,
  });
  if (auditError) throw new ContentAccessDeniedError();

  return { signedUrl: signed.signedUrl, expiresIn };
}
