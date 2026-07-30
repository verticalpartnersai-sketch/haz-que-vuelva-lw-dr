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
};

export interface MemberCatalogGateway {
  listActiveProducts(): Promise<CatalogProductRecord[]>;
  listEntitledProductCodes(memberId: string): Promise<string[]>;
}

export async function listMemberCatalog({
  gateway,
  memberId,
}: {
  gateway: MemberCatalogGateway;
  memberId: string;
}): Promise<MemberCatalogItem[]> {
  if (!memberId) throw new Error("catalog_member_id_required");

  const [records, entitlementCodes] = await Promise.all([
    gateway.listActiveProducts(),
    gateway.listEntitledProductCodes(memberId),
  ]);
  const entitlements = new Set(
    entitlementCodes.filter(isProductCode),
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
    }));
}
