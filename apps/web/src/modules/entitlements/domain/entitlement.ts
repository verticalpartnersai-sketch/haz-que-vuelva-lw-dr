import type { ProductCode } from "@/modules/catalog/domain/product";

export type GrantSource = "purchase" | "manual";
export type RevocationReason =
  | "cancelled"
  | "refunded"
  | "charged_back"
  | "manual";

export type AccessGrant = {
  id: string;
  memberId: string;
  productCode: ProductCode;
  source: GrantSource;
  sourceReference: string;
  grantedAt: Date;
  revokedAt: Date | null;
  revocationReason: RevocationReason | null;
};

export function hasEffectiveAccess(grants: readonly AccessGrant[]) {
  return grants.some((grant) => grant.revokedAt === null);
}
