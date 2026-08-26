import type { Metadata } from "next";

import { funnelLocaleForEnvironment } from "@/features/i18n/funnel-locale";
import { OfferPage } from "@/features/offer/offer-page";

export async function generateMetadata(): Promise<Metadata> {
  const locale = funnelLocaleForEnvironment(process.env.NODE_ENV);
  const title = locale === "pt"
    ? "Seu plano Haz Que Vuelva"
    : "Tu plan Haz Que Vuelva";
  const description = locale === "pt"
    ? "Conheça o plano de 7 dias Haz Que Vuelva e tudo o que está incluído no acesso."
    : "Conoce el plan de 7 días Haz Que Vuelva y todo lo que está incluido en el acceso.";
  return {
    title,
    description,
    alternates: { canonical: "/off" },
    openGraph: {
      title,
      description,
      locale: locale === "pt" ? "pt_BR" : "es_MX",
      siteName: "Haz Que Vuelva",
      type: "website",
      url: "/off",
      images: [{
        alt: "Haz Que Vuelva",
        height: 630,
        url: "/images/social/quiz-og.jpg",
        width: 1200,
      }],
    },
    robots: { index: true, follow: true },
  };
}

export default function Page() {
  const locale = funnelLocaleForEnvironment(process.env.NODE_ENV);
  return <OfferPage locale={locale} />;
}
