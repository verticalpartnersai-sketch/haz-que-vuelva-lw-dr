import type { Metadata } from "next";

import {
  configuredOfferUrl,
  type OfferSearchParams,
  withPreservedQuery,
} from "@/features/upsells/offer-links";
import { PostPurchaseOfferPage } from "@/features/upsells/postpurchase-offer-page";

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
    <PostPurchaseOfferPage
      acceptHref={configuredOfferUrl(
        process.env.NEXT_PUBLIC_UPSELL_1_ACCEPT_URL,
        query,
      )}
      declineHref={withPreservedQuery("/d1", query)}
      route="up1"
    />
  );
}
