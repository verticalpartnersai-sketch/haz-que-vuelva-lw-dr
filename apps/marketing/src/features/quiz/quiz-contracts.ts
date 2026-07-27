export type QuestionId =
  | "current_state"
  | "distance_time"
  | "last_action"
  | "dominant_pain"
  | "dominant_fear";

export type CurrentState =
  | "green_contact"
  | "cold_contact"
  | "blocked"
  | "third_person"
  | "intermittent"
  | "logistics"
  | "explicit_stop";

export type DistanceTime = "lt_7d" | "1_4w" | "1_3m" | "gt_3m";

export type LastAction =
  | "long_message"
  | "insistence"
  | "blind_silence"
  | "jealousy"
  | "intimacy"
  | "pause";

export type DominantPain =
  | "silence"
  | "replacement"
  | "guilt"
  | "second_option";

export type DominantFear =
  | "forgotten"
  | "other_woman"
  | "closed_window"
  | "repeat_cycle";

export type DesireCommitment = "desire_missing" | "desire_control";
export type ExecutionCommitment = "commit_route" | "commit_simple";

export type QuizRoute =
  | "red"
  | "gray"
  | "yellow"
  | "green"
  | "logistics"
  | "third_person";

export type DistanceBand = "low" | "medium" | "high";

export type QuizAnswers = {
  current_state?: CurrentState;
  distance_time?: DistanceTime;
  last_action?: LastAction;
  dominant_pain?: DominantPain;
  dominant_fear?: DominantFear;
  desire?: DesireCommitment;
  commitment?: ExecutionCommitment;
};

export type QuizOption = {
  emoji?: string;
  label: string;
  transition?: string;
  value: string;
};

export type QuizQuestion = {
  context?: string;
  id: QuestionId;
  microcopy?: string;
  options: readonly QuizOption[];
  title: string;
  variant?: "cards";
};

export type LoaderCopy = {
  captions: readonly string[];
  states: readonly string[];
  title: string;
};

export type RouteCopy = {
  bridge: string;
  cta: string;
  diagnosis: readonly string[];
  firstAction: string;
  headline: string;
  prediagnosisHeadline: string;
  publicName: string;
};

export type DemonstrationCase = {
  decision: string;
  description: string;
  eyebrow: string;
  proof: "decision" | "routes" | "scale";
};

export type FaqItem = {
  answer: string;
  question: string;
};

export type OfferItem = {
  description: string;
  title: string;
};

export type QuizCopy = {
  commitment: {
    options: readonly QuizOption[];
    title: string;
  };
  demonstration: {
    cases: readonly DemonstrationCase[];
    cta: string;
    dynamicLabels: readonly [string, string, string];
    headline: string;
    subheadline: string;
  };
  desire: {
    options: readonly QuizOption[];
    title: string;
  };
  faq: {
    cta: string;
    items: readonly FaqItem[];
    title: string;
  };
  intro: {
    cta: string;
    eyebrow: string;
    headline: string;
    privacy: string;
    subheadline: string;
  };
  loaderOne: LoaderCopy;
  loaderTwo: LoaderCopy;
  painImpulses: Record<DominantPain, { impulse: string; sentence: string }>;
  pitch: {
    bullets: readonly string[];
    caption: string;
    cta: string;
    guarantee: string;
    headline: string;
    items: readonly OfferItem[];
    method: readonly string[];
    microcopy: string;
    paragraphs: readonly string[];
    price: string;
    proofTitle: string;
  };
  prediagnosis: {
    alert: string;
    bodyAfterLoop: readonly string[];
    cta: string;
    loop: readonly string[];
    microcopy: string;
    needs: readonly string[];
    scoreSubtitle: string;
    scoreTitle: string;
  };
  questions: readonly QuizQuestion[];
  result: {
    confirmation: string;
    disclaimer: string;
    labels: {
      action: string;
      contact: string;
      distance: string;
      index: string;
      pain: string;
    };
    timeline: readonly { label: string; text: string }[];
    timelineTitle: string;
    titlePrefix: string;
  };
  routes: Record<QuizRoute, RouteCopy>;
  summaries: {
    action: Record<LastAction, string>;
    distance: Record<DistanceTime, string>;
    pain: Record<DominantPain, string>;
    state: Record<CurrentState, string>;
  };
  ui: {
    answerHint: string;
    changeLanguage: string;
    loadingProofLabel: string;
    restart: string;
    skip: string;
  };
};

export type QuizStage =
  | "intro"
  | "question"
  | "loader-one"
  | "prediagnosis"
  | "desire"
  | "demonstration"
  | "commitment"
  | "loader-two"
  | "result";
