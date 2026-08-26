import type { Metadata } from "next";
import { Suspense } from "react";

import { UtmifyBackRedirect } from "@/features/analytics/utmify-back-redirect";
import { funnelLocaleForEnvironment } from "@/features/i18n/funnel-locale";
import { QuizFlowPage } from "@/features/quiz/quiz-flow-page";

export async function generateMetadata(): Promise<Metadata> {
  const locale = funnelLocaleForEnvironment(process.env.NODE_ENV);
  const title = locale === "pt"
    ? "Quiz privado para reconquistar o seu ex"
    : "Quiz privado para reconquistar a tu ex";
  const description = locale === "pt"
    ? "Responda ao quiz e descubra sua probabilidade de reconquista e o próximo movimento para os próximos 7 dias."
    : "Responde el quiz y descubre tu probabilidad de reconquista y el próximo movimiento para los siguientes 7 días.";

  return {
    title,
    description,
    alternates: { canonical: "/quiz" },
    openGraph: {
      title,
      description,
      url: "/quiz",
      siteName: "Haz Que Vuelva",
      locale: locale === "pt" ? "pt_BR" : "es_MX",
      type: "website",
      images: [
        {
          url: "/images/social/quiz-og.jpg",
          width: 1200,
          height: 630,
          alt: "Haz Que Vuelva",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/social/quiz-og.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

function QuizFallback() {
  return <div className="quiz-v2-fallback" aria-label="Haz Que Vuelva" />;
}

export default function Page() {
  const locale = funnelLocaleForEnvironment(process.env.NODE_ENV);
  return (
    <>
      <Suspense fallback={<QuizFallback />}>
        <QuizFlowPage
          development={process.env.NODE_ENV === "development"}
          locale={locale}
        />
      </Suspense>
      <UtmifyBackRedirect
        target={process.env.NEXT_PUBLIC_UTMIFY_BACK_REDIRECT_URL}
      />
    </>
  );
}
