import type { Locale } from "@/features/i18n/locale";
import type { QuizRoute } from "@/features/quiz/quiz-contracts";
import { salesCopyEn } from "@/features/quiz/quiz-sales-copy-en";
import { salesCopyEs } from "@/features/quiz/quiz-sales-copy-es";
import { salesCopyPt } from "@/features/quiz/quiz-sales-copy-pt";

export type SalesRouteCopy = {
  consequence: string;
  diagnosis: string;
  headline: string;
  label: string;
  proofAlt: string;
  proofIntro: string;
  proofOutro: string;
};

export type SalesValueItem = {
  description: string;
  image: "calendar" | "cover" | "decision" | "routes" | "scale";
  kind: string;
  title: string;
  value: string;
};

export type SalesCopy = {
  badge: string;
  checkout: {
    access: string;
    compareAt: string;
    heading: string;
    price: string;
    summary: readonly string[];
  };
  closing: {
    body: string;
    heading: string;
  };
  cost: {
    body: string;
    heading: string;
  };
  cta: string;
  ctaMicrocopy: string;
  faq: {
    items: readonly { answer: string; question: string }[];
    title: string;
  };
  guarantee: {
    body: string;
    heading: string;
  };
  heroSubheadline: string;
  mechanism: {
    claim: string;
    closing: string;
    heading: string;
    intro: string;
    sequence: readonly string[];
  };
  mirror: {
    action: string;
    conclusion: string;
    distance: string;
    heading: string;
    opening: string;
  };
  offer: {
    body: string;
    eyebrow: string;
    heading: string;
  };
  proof: {
    count: string;
    heading: string;
    universalAlt: string;
    universalIntro: string;
    universalOutro: string;
  };
  reveal: {
    body: string;
    heading: string;
  };
  routeBadge: string;
  routes: Record<QuizRoute, SalesRouteCopy>;
  stickyAfterOffer: string;
  stickyBeforeOffer: string;
  timeline: {
    body: string;
    heading: string;
    items: readonly { day: string; text: string; title: string }[];
  };
  value: {
    body: string;
    heading: string;
    items: readonly SalesValueItem[];
    total: string;
  };
};

export function quizSalesCopyFor(locale: Locale): SalesCopy {
  return {
    en: salesCopyEn,
    es: salesCopyEs,
    pt: salesCopyPt,
  }[locale];
}
