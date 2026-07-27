import type { Locale } from "@/features/i18n/locale";
import { quizCopyEs } from "@/features/quiz/quiz-data";
import { quizCopyEn } from "@/features/quiz/quiz-data-en";
import { quizCopyPt } from "@/features/quiz/quiz-data-pt";

export function quizContentFor(locale: Locale) {
  return {
    en: quizCopyEn,
    es: quizCopyEs,
    pt: quizCopyPt,
  }[locale];
}
