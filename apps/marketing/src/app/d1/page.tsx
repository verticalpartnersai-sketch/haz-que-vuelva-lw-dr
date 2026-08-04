import type { Metadata } from "next";

import {
  configuredOfferUrl,
  type OfferSearchParams,
  withPreservedQuery,
} from "@/features/upsells/offer-links";
import { ReconquistaOfferPage } from "@/features/upsells/reconquista-offer-page";

export const metadata: Metadata = {
  title: "Antes de continuar · Reconquista 30",
  description:
    "Revisión final para añadir el protocolo completo Reconquista 30.",
  robots: { follow: false, index: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<OfferSearchParams>;
}) {
  const query = await searchParams;

  return (
    <ReconquistaOfferPage
      acceptHref={configuredOfferUrl(
        process.env.NEXT_PUBLIC_DOWNSELL_1_ACCEPT_URL,
        query,
      )}
      declineHref={withPreservedQuery("/up2", query)}
      variant="downsell"
    />
  );
}
