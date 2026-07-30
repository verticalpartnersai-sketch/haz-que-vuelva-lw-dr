import {
  isProductCode,
  type ProductCode,
} from "../../catalog/domain/product.ts";

export class ReadingProgressAccessDeniedError extends Error {}
export class ReadingProgressValidationError extends Error {}

export type SavedReadingProgress = {
  completedAt: string | null;
  progressPercent: number;
  updatedAt: string;
};

export interface ReadingProgressGateway {
  save(input: {
    productCode: ProductCode;
    progressPercent: number;
  }): Promise<SavedReadingProgress | null>;
}

export async function saveReadingProgress(input: {
  gateway: ReadingProgressGateway;
  productCode: string;
  progressPercent: number;
}) {
  if (
    !isProductCode(input.productCode) ||
    input.productCode === "vuelve_ia" ||
    !Number.isInteger(input.progressPercent) ||
    input.progressPercent < 0 ||
    input.progressPercent > 100
  ) {
    throw new ReadingProgressValidationError();
  }

  const progress = await input.gateway.save({
    productCode: input.productCode,
    progressPercent: input.progressPercent,
  });
  if (!progress) throw new ReadingProgressAccessDeniedError();
  return progress;
}
