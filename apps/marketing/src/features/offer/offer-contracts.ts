export const offerSectionIds = [
  "timer",
  "before_after",
  "emotional_diagnosis",
  "probability",
  "urgency",
  "product_reveal",
  "bonus_toggle",
  "pricing",
  "rating",
  "benefits",
  "statistics",
  "testimonials",
  "pricing_repeat",
  "guarantee",
  "faq",
] as const;

export type OfferSectionId = (typeof offerSectionIds)[number];
export type OfferLocale = "es" | "pt";
export type OfferScoreBand = "82_86" | "87_91" | "92_96";

export type OfferBonus = {
  description: string;
  id: "bonus_emergency" | "bonus_messages" | "bonus_signals";
  name: string;
};

export type OfferTestimonial = {
  id: "anonymous" | "camila" | "sofia" | "valentina";
  location: string;
  name: string;
  status: string;
  text: string;
  title: string;
};

export type OfferCopy = {
  access: string;
  benefits: readonly string[];
  bonusFormat: string;
  bonusHeading: string;
  bonusToggle: string;
  bonuses: readonly OfferBonus[];
  compareAt: string;
  cta: string;
  faq: readonly { answer: string; question: string }[];
  guarantee: { body: string; heading: string; seal: string };
  guaranteeDays: 7;
  locale: OfferLocale;
  payment: string;
  price: "US$8,49";
  probability: {
    label: string;
    level: string;
    range: string;
  };
  product: {
    body: readonly string[];
    headline: string;
    name: "HAZ QUE VUELVA™";
    preheadline: string;
  };
  rating: { badge: string; heading: string; value: string };
  statisticsHeading: string;
  statistics: readonly { label: string; value: "72%" | "87%" | "94%" }[];
  testimonials: readonly OfferTestimonial[];
  timerLabel: string;
  timerSeconds: 600;
  transformation: {
    current: { body: string; label: string; state: string };
    goal: { body: string; label: string; state: string };
    restored: string;
  };
  urgency: { alert: string; note: string };
};
