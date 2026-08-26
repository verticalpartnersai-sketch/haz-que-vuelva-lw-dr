import type { FunnelLocale } from "@/features/i18n/funnel-locale";
import type { QuizFlowCopy } from "./quiz-flow-contracts";
import { quizFlowCopyEs } from "./quiz-flow-copy-es";
import { quizFlowCopyPt } from "./quiz-flow-copy-pt";

export function quizFlowCopyFor(locale: FunnelLocale): QuizFlowCopy {
  return locale === "pt" ? quizFlowCopyPt : quizFlowCopyEs;
}
