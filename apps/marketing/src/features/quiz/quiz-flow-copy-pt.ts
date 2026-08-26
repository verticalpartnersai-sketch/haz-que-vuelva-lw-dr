import type { QuizFlowCopy } from "./quiz-flow-contracts.ts";
import { quizFlowPostScreensPt, quizFlowProofsPt, quizFlowResultPt } from "./quiz-flow-copy-pt-post.ts";
import { quizFlowQuestionScreensPt } from "./quiz-flow-copy-pt-questions.ts";

export const quizFlowCopyPt: QuizFlowCopy = {
  locale: "pt",
  screens: [...quizFlowQuestionScreensPt, ...quizFlowPostScreensPt],
  proofs: quizFlowProofsPt,
  result: quizFlowResultPt,
  ui: {
    back: "Voltar",
    continue: "CONTINUAR",
    next: "PRÓXIMO",
    selectAtLeastOne: "Escolha ao menos uma opção para continuar.",
  },
};
