import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ReadingProgressGateway,
  SavedReadingProgress,
} from "@/modules/content/application/save-reading-progress";

type ReadingProgressRpcRow = {
  completed_at: string | null;
  progress_percent: number;
  updated_at: string;
};

export class SupabaseReadingProgress implements ReadingProgressGateway {
  constructor(private readonly client: SupabaseClient) {}

  async save(
    input: Parameters<ReadingProgressGateway["save"]>[0],
  ): Promise<SavedReadingProgress | null> {
    const { data, error } = await this.client.rpc(
      "set_member_reading_progress",
      {
        p_product_code: input.productCode,
        p_progress_percent: input.progressPercent,
      },
    );
    if (error) {
      if (
        error.message.includes("reading_progress_access_denied") ||
        error.message.includes("authentication_required")
      ) {
        return null;
      }
      throw new Error(`reading_progress_save_failed:${error.code}`);
    }

    const row = (Array.isArray(data) ? data[0] : data) as
      | ReadingProgressRpcRow
      | undefined;
    if (!row) return null;
    return {
      completedAt: row.completed_at,
      progressPercent: row.progress_percent,
      updatedAt: row.updated_at,
    };
  }
}
