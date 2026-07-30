import type { Metadata } from "next";

import { vuelveIaOffer } from "@/features/upsells/offer-data";
import {
  configuredOfferUrl,
  type OfferSearchParams,
  withPreservedQuery,
} from "@/features/upsells/offer-links";
import { UpsellOfferPage } from "@/features/upsells/offer-page";

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
    <UpsellOfferPage
      acceptHref={configuredOfferUrl(
        process.env.NEXT_PUBLIC_UPSELL_2_ACCEPT_URL,
        query,
      )}
      declineHref={withPreservedQuery("/gracias", query)}
      offer={vuelveIaOffer}
    />
  );
}
