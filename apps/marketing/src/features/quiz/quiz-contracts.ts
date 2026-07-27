export type QuestionId =
  | "tiempo_ruptura"
  | "estado_canal"
  | "intento_previo"
  | "tercera_persona"
  | "accion_urgente";

export type QuizRoute =
  | "red"
  | "gray"
  | "yellow"
  | "green"
  | "logistics"
  | "third_person";

export type MainError =
  | "texton"
  | "insistencia"
  | "contacto_cero_ciego"
  | "celos_vigilancia"
  | "intimidad_intermitente"
  | "none";

export type QuizOption = {
  label: string;
  value: string;
  tags: readonly string[];
};

export type QuizQuestion = {
  id: QuestionId;
  title: string;
  microcopy: string;
  transition: string;
  options: readonly QuizOption[];
};

export type QuizAnswers = Partial<Record<QuestionId, string>>;

export type ResultDefinition = {
  route: QuizRoute;
  label: string;
  headline: string;
  diagnosis: string;
  decisionTitle: string;
  decision: string;
  pitch?: readonly string[];
  cta: string;
  microcopy?: string;
  safetySteps?: readonly string[];
  closing?: string;
};
