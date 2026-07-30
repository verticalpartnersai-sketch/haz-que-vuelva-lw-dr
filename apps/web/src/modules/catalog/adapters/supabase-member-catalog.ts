import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CatalogProductRecord,
  MemberCatalogGateway,
} from "@/modules/catalog/application/list-member-catalog";

export class SupabaseMemberCatalog implements MemberCatalogGateway {
  constructor(private readonly client: SupabaseClient) {}

  async listActiveProducts(): Promise<CatalogProductRecord[]> {
    const { data, error } = await this.client
      .from("products")
      .select("code,name,description,sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`catalog_products_lookup_failed:${error.code}`);

    return (data ?? []).map((record) => ({
      code: record.code,
      name: record.name,
      description: record.description,
      sortOrder: record.sort_order,
    }));
  }

  async listEntitledProductCodes(memberId: string): Promise<string[]> {
    const { data, error } = await this.client
      .from("effective_entitlements")
      .select("product_code")
      .eq("member_id", memberId);

    if (error) {
      throw new Error(`catalog_entitlements_lookup_failed:${error.code}`);
    }

    return (data ?? []).map((record) => record.product_code);
  }

  async listReadingProgress(memberId: string) {
    const { data, error } = await this.client
      .from("member_reading_progress")
      .select("product_code,progress_percent")
      .eq("member_id", memberId);

    if (error) {
      throw new Error(`catalog_reading_progress_lookup_failed:${error.code}`);
    }

    return (data ?? []).map((record) => ({
      productCode: record.product_code,
      progressPercent: record.progress_percent,
    }));
  }
}
