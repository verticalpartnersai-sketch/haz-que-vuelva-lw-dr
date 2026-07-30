import {
  isProductCode,
  type ProductCode,
} from "../domain/product.ts";

export type CatalogProductRecord = {
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
};

export type MemberCatalogItem = {
  code: ProductCode;
  name: string;
  description: string | null;
  sortOrder: number;
  entitled: boolean;
  progressPercent?: number;
};

export interface MemberCatalogGateway {
  listActiveProducts(): Promise<CatalogProductRecord[]>;
  listEntitledProductCodes(memberId: string): Promise<string[]>;
  listReadingProgress(
    memberId: string,
  ): Promise<Array<{ productCode: string; progressPercent: number }>>;
}

export async function listMemberCatalog({
  gateway,
  memberId,
}: {
  gateway: MemberCatalogGateway;
  memberId: string;
}): Promise<MemberCatalogItem[]> {
  if (!memberId) throw new Error("catalog_member_id_required");

  const [records, entitlementCodes, progressRecords] = await Promise.all([
    gateway.listActiveProducts(),
    gateway.listEntitledProductCodes(memberId),
    gateway.listReadingProgress(memberId),
  ]);
  const entitlements = new Set(
    entitlementCodes.filter(isProductCode),
  );
  const progressByProduct = new Map(
    progressRecords
      .filter(
        (record) =>
          isProductCode(record.productCode) &&
          Number.isInteger(record.progressPercent) &&
          record.progressPercent >= 0 &&
          record.progressPercent <= 100,
      )
      .map((record) => [record.productCode, record.progressPercent]),
  );

  return records
    .filter((record) => isProductCode(record.code))
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((record) => ({
      code: record.code as ProductCode,
      name: record.name,
      description: record.description,
      sortOrder: record.sortOrder,
      entitled: entitlements.has(record.code as ProductCode),
      progressPercent: progressByProduct.get(record.code as ProductCode),
    }));
}
