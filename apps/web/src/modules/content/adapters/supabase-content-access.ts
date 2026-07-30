import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ContentAccessGateway,
  ContentArtifact,
  ContentSource,
} from "../application/request-file-access.ts";

type ContentRelation = {
  active: boolean;
  product_code: string;
};

export class SupabaseContentAccess implements ContentAccessGateway {
  constructor(private readonly client: SupabaseClient) {}

  async file(fileId: string): Promise<ContentSource | null> {
    const { data, error } = await this.client
      .from("content_files")
      .select("id,content_items!inner(product_code,active)")
      .eq("id", fileId)
      .maybeSingle();
    if (error) throw new Error(`content_file_lookup_failed:${error.code}`);
    if (!data) return null;

    const relation = (Array.isArray(data.content_items)
      ? data.content_items[0]
      : data.content_items) as ContentRelation | undefined;
    if (!relation) return null;
    return {
      active: relation.active,
      id: data.id,
      productCode: relation.product_code,
    };
  }

  async hasEntitlement(memberId: string, productCode: string) {
    const { data, error } = await this.client
      .from("effective_entitlements")
      .select("product_code")
      .eq("member_id", memberId)
      .eq("product_code", productCode)
      .maybeSingle();
    if (error) throw new Error(`content_entitlement_lookup_failed:${error.code}`);
    return Boolean(data);
  }

  async artifact(
    sourceFileId: string,
    memberId: string,
  ): Promise<ContentArtifact | null> {
    const { data, error } = await this.client
      .from("watermarked_files")
      .select("storage_bucket,storage_path,audit_marker")
      .eq("source_file_id", sourceFileId)
      .eq("member_id", memberId)
      .maybeSingle();
    if (error) throw new Error(`content_artifact_lookup_failed:${error.code}`);
    if (!data) return null;
    return {
      auditMarker: data.audit_marker,
      storageBucket: data.storage_bucket,
      storagePath: data.storage_path,
    };
  }

  async enqueue(sourceFileId: string, memberId: string) {
    const { error } = await this.client.rpc("enqueue_content_watermark", {
      p_member_id: memberId,
      p_source_file_id: sourceFileId,
    });
    if (error) throw new Error(`content_watermark_enqueue_failed:${error.code}`);
  }

  async sign(
    storageBucket: string,
    storagePath: string,
    expiresInSeconds: number,
  ) {
    const { data, error } = await this.client.storage
      .from(storageBucket)
      .createSignedUrl(storagePath, expiresInSeconds, { download: true });
    if (error || !data) return null;
    return data.signedUrl;
  }

  async recordDownload(input: {
    auditMarker: string;
    memberId: string;
    sourceFileId: string;
  }) {
    const { error } = await this.client.from("download_events").insert({
      audit_marker: input.auditMarker,
      member_id: input.memberId,
      source_file_id: input.sourceFileId,
    });
    if (error) throw new Error(`content_download_audit_failed:${error.code}`);
  }
}
