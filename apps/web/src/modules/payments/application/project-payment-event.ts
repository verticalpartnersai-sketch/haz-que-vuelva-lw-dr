import type { ProductCode } from "@/modules/catalog/domain/product";
import type { NormalizedPaymentEvent } from "@/modules/payments/domain/payment-event";

export interface ExternalOfferCatalog {
  productForOffer(input: {
    provider: "perfect_pay";
    productCode: string;
    planCode: string;
  }): Promise<ProductCode | null>;
}

export interface MemberDirectory {
  resolve(email: string, createIfMissing: boolean): Promise<string | null>;
}

export interface PaymentProjection {
  apply(input: {
    event: NormalizedPaymentEvent;
    memberId: string | null;
    productCode: ProductCode;
  }): Promise<void>;
}

type Dependencies = {
  members: MemberDirectory;
  offers: ExternalOfferCatalog;
  projection: PaymentProjection;
};

export class UnmappedOfferError extends Error {}

export async function projectPaymentEvent(
  event: NormalizedPaymentEvent,
  dependencies: Dependencies,
) {
  const productCode = await dependencies.offers.productForOffer(event);
  if (!productCode) {
    throw new UnmappedOfferError(
      `No mapping for Perfect Pay offer ${event.productCode}/${event.planCode}`,
    );
  }
  const memberId = await dependencies.members.resolve(
    event.customerEmail,
    event.effect === "grant",
  );
  await dependencies.projection.apply({ event, memberId, productCode });
}
