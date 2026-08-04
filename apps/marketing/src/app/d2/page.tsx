import type { Metadata } from "next";

import {
  configuredOfferUrl,
  type OfferSearchParams,
  withPreservedQuery,
} from "@/features/upsells/offer-links";
import { VuelveIaOfferPage } from "@/features/upsells/vuelve-ia-offer-page";

export const metadata: Metadata = {
  title: "Antes de continuar · VUELVE IA",
  description:
    "Revisión final para añadir el Diagnóstico VUELVE IA completo.",
  robots: { follow: false, index: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<OfferSearchParams>;
}) {
  const query = await searchParams;

  return (
    <VuelveIaOfferPage
      acceptHref={configuredOfferUrl(
        process.env.NEXT_PUBLIC_DOWNSELL_2_ACCEPT_URL,
        query,
      )}
      declineHref={withPreservedQuery("/gracias", query)}
      variant="downsell"
    />
  );
}
