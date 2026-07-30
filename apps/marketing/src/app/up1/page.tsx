import type { Metadata } from "next";

import { reconquista30Offer } from "@/features/upsells/offer-data";
import {
  configuredOfferUrl,
  type OfferSearchParams,
  withPreservedQuery,
} from "@/features/upsells/offer-links";
import { UpsellOfferPage } from "@/features/upsells/offer-page";

export const metadata: Metadata = {
  title: "Reconquista 30",
  description:
    "El protocolo de 30 días para sostener una reapertura, medir reciprocidad y decidir con claridad.",
  robots: { follow: false, index: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<OfferSearchParams>;
}) {
  const query = await searchParams;

  return (
    <UpsellOfferPage
      acceptHref={configuredOfferUrl(
        process.env.NEXT_PUBLIC_UPSELL_1_ACCEPT_URL,
        query,
      )}
      declineHref={withPreservedQuery("/up2", query)}
      offer={reconquista30Offer}
    />
  );
}
