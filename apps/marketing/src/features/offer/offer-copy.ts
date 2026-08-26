import type { FunnelLocale } from "@/features/i18n/funnel-locale";
import type { OfferCopy } from "./offer-contracts";
import { offerCopyEs } from "./offer-copy-es";
import { offerCopyPt } from "./offer-copy-pt";

export function offerCopyFor(locale: FunnelLocale): OfferCopy {
  return locale === "pt" ? offerCopyPt : offerCopyEs;
}
