export const orderedQuizFlowStages = [
  "desire_confirm",
  "age",
  "separation_time",
  "breakup_initiator",
  "breakup_reasons",
  "relationship_duration",
  "ex_emotionality",
  "mechanism_neuro",
  "dominant_pain",
  "third_person",
  "current_state",
  "urgency_interstitial",
  "shared_memories",
  "time_together",
  "first_date",
  "ex_qualities",
  "intimacy",
  "obsession_interstitial",
  "analysis_loader",
  "expert_intro",
  "social_proof",
  "commitment",
  "plan_loader",
  "final_result",
] as const;

export type QuizFlowStageId = (typeof orderedQuizFlowStages)[number];

export const scoreQuestionIds = [
  "separation_time",
  "breakup_initiator",
  "breakup_reasons",
  "ex_emotionality",
  "third_person",
  "current_state",
] as const;

export type ScoreQuestionId = (typeof scoreQuestionIds)[number];
export type ScoreBand = "82_86" | "87_91" | "92_96";

export type QuizFlowAnswers = Partial<{
  desire_confirm: "want_him_back" | "not_sure_yet";
  age: "age_18_28" | "age_29_38" | "age_39_48" | "age_49_plus";
  separation_time: "lt_7d" | "around_1m" | "m2_6" | "gt_6m";
  breakup_initiator: "he_ended" | "i_ended" | "mutual";
  breakup_reasons: Array<
    | "constant_fights"
    | "he_stopped_loving"
    | "different_goals"
    | "he_cheated"
    | "i_cheated"
    | "external_pressure"
    | "other_reason"
  >;
  relationship_duration: "gt_3y" | "y1_3" | "m6_12" | "lt_6m";
  ex_emotionality: "emotion_1" | "emotion_2" | "emotion_3" | "emotion_4";
  dominant_pain:
    | "emptiness"
    | "emotional_rollercoaster"
    | "memories"
    | "other_woman"
    | "lost_future"
    | "other_pain";
  third_person: "no" | "unknown" | "yes";
  current_state:
    | "no_contact"
    | "ignored"
    | "blocked"
    | "practical_only"
    | "occasional"
    | "friends"
    | "post_breakup_intimacy";
  shared_memories: string[];
  time_together: string[];
  first_date: string;
  ex_qualities: string[];
  intimacy: string;
  commitment: "commit_1" | "commit_2" | "commit_3" | "commit_4";
}>;

export type QuizSessionV2 = {
  completedAt: string;
  score: number;
  scoreBand: ScoreBand;
  version: "hqv_quiz_v2";
};

export type QuizFlowOption = {
  emoji?: string;
  label: string;
  transition?: string;
  value: string;
};

export type QuizFlowScreen = {
  asset?: string;
  body?: readonly string[];
  button?: string;
  id: QuizFlowStageId;
  instruction?: string;
  multiple?: boolean;
  options?: readonly QuizFlowOption[];
  progress?: number;
  subtitle?: string;
  title: string;
  type:
    | "authority"
    | "commitment"
    | "interstitial"
    | "loader"
    | "proof"
    | "question"
    | "result";
};

export type QuizProofStory = {
  conclusion: string;
  context: string;
  id: "camila" | "sofia" | "valentina";
  messages: readonly string[];
  name: string;
  src: string;
};

export type QuizFlowCopy = {
  locale: "es" | "pt";
  proofs: readonly QuizProofStory[];
  result: {
    badge: string;
    button: string;
    outcomesHeading: string;
    question: string;
    scoreLabel: string;
    scoreLevel: string;
    title: string;
    timeline: readonly { label: string; text: string }[];
    outcomes: readonly string[];
  };
  screens: readonly QuizFlowScreen[];
  ui: {
    back: string;
    continue: string;
    next: string;
    selectAtLeastOne: string;
  };
};
