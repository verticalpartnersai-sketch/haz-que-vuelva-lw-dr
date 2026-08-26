import type { QuizFlowCopy } from "./quiz-flow-contracts.ts";
import { quizFlowPostScreensEs, quizFlowProofsEs, quizFlowResultEs } from "./quiz-flow-copy-es-post.ts";
import { quizFlowQuestionScreensEs } from "./quiz-flow-copy-es-questions.ts";

export const quizFlowCopyEs: QuizFlowCopy = {
  locale: "es",
  screens: [...quizFlowQuestionScreensEs, ...quizFlowPostScreensEs],
  proofs: quizFlowProofsEs,
  result: quizFlowResultEs,
  ui: {
    back: "Volver",
    continue: "CONTINUAR",
    next: "SIGUIENTE",
    selectAtLeastOne: "Selecciona al menos una opción para continuar.",
  },
};
