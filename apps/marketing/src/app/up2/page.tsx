import type { Metadata } from "next";

import {
  configuredOfferUrl,
  type OfferSearchParams,
  withPreservedQuery,
} from "@/features/upsells/offer-links";
import { PostPurchaseOfferPage } from "@/features/upsells/postpurchase-offer-page";

export const metadata: Metadata = {
  title: "Diagnóstico VUELVE IA",
  description:
    "Analiza tu conversación, separa hechos de inferencias y recibe una decisión justificada.",
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
        process.env.NEXT_PUBLIC_UPSELL_2_ACCEPT_URL,
        query,
      )}
      declineHref={withPreservedQuery("/d2", query)}
      route="up2"
    />
  );
}
