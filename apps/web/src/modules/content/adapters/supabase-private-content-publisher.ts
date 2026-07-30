import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  PrivateContentPublisher,
  PublishedContentPdf,
} from "../application/publish-content-pdf.ts";
import { AdminReauthenticationRequiredError } from "../../identity/application/admin-reauthentication.ts";

type PublishedRow = {
  content_file_id: string;
  content_item_id: string;
  published_version: number;
};

export class SupabasePrivateContentPublisher
  implements PrivateContentPublisher
{
  constructor(
    private readonly metadataClient: SupabaseClient,
    private readonly storageClient: SupabaseClient,
  ) {}

  async upload(input: {
    bucket: string;
    bytes: Uint8Array;
    contentType: string;
    path: string;
  }) {
    const body = input.bytes.slice().buffer as ArrayBuffer;
    const { error } = await this.storageClient.storage
      .from(input.bucket)
      .upload(input.path, body, {
        cacheControl: "0",
        contentType: input.contentType,
        upsert: false,
      });
    if (error) throw new Error(`content_pdf_upload_failed:${error.name}`);
  }

  async persist(input: {
    bucket: string;
    contentType: string;
    path: string;
    productCode: string;
    reauthenticationTokenHash: string;
    sha256: string;
    sizeBytes: number;
    title: string;
  }): Promise<PublishedContentPdf> {
    const { data, error } = await this.metadataClient.rpc(
      "publish_content_pdf_with_reauthentication",
      {
        p_mime_type: input.contentType,
        p_product_code: input.productCode,
        p_reauth_token_hash: input.reauthenticationTokenHash,
        p_sha256: input.sha256,
        p_size_bytes: input.sizeBytes,
        p_storage_bucket: input.bucket,
        p_storage_path: input.path,
        p_title: input.title,
      },
    );
    if (error?.code === "42501") {
      throw new AdminReauthenticationRequiredError(
        "admin_reauthentication_required",
      );
    }
    if (error) throw new Error(`content_pdf_persist_failed:${error.code}`);

    const row = (data as PublishedRow[] | null)?.[0];
    if (!row) throw new Error("content_pdf_persist_result_missing");
    return {
      contentFileId: row.content_file_id,
      contentItemId: row.content_item_id,
      version: row.published_version,
    };
  }

  async remove(bucket: string, path: string) {
    const { error } = await this.storageClient.storage
      .from(bucket)
      .remove([path]);
    if (error) throw new Error(`content_pdf_cleanup_failed:${error.name}`);
  }
}
