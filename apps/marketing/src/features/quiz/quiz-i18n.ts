import type { Locale } from "@/features/i18n/locale";
import {
  commonOfferItems,
  loadingMessages,
  mainErrorCopy,
  quizQuestions,
  results,
} from "@/features/quiz/quiz-data";
import {
  commonOfferItemsEn,
  loadingMessagesEn,
  mainErrorCopyEn,
  quizQuestionsEn,
  resultsEn,
} from "@/features/quiz/quiz-data-en";
import {
  commonOfferItemsPt,
  loadingMessagesPt,
  mainErrorCopyPt,
  quizQuestionsPt,
  resultsPt,
} from "@/features/quiz/quiz-data-pt";

export function quizContentFor(locale: Locale) {
  if (locale === "pt") {
    return {
      commonOfferItems: commonOfferItemsPt,
      loadingMessages: loadingMessagesPt,
      mainErrorCopy: mainErrorCopyPt,
      questions: quizQuestionsPt,
      results: resultsPt,
    };
  }

  if (locale === "en") {
    return {
      commonOfferItems: commonOfferItemsEn,
      loadingMessages: loadingMessagesEn,
      mainErrorCopy: mainErrorCopyEn,
      questions: quizQuestionsEn,
      results: resultsEn,
    };
  }

  return {
    commonOfferItems,
    loadingMessages,
    mainErrorCopy,
    questions: quizQuestions,
    results,
  };
}
