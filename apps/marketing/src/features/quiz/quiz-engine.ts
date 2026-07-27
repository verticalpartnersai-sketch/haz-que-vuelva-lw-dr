import {
  type MainError,
  type QuestionId,
  type QuizAnswers,
  type QuizRoute,
} from "@/features/quiz/quiz-data";
import type { Locale } from "@/features/i18n/locale";
import { quizContentFor } from "@/features/quiz/quiz-i18n";

export function getAnswerLabel(
  questionId: QuestionId,
  value: string | undefined,
  locale: Locale,
) {
  const question = quizContentFor(locale).questions.find(
    (item) => item.id === questionId,
  );
  return (
    question?.options.find((option) => option.value === value)?.label ??
    {
      es: "prefieres no precisar esa respuesta",
      pt: "você prefere não especificar essa resposta",
      en: "you prefer not to specify that answer",
    }[locale]
  );
}

export function getRecapLabel(
  questionId: QuestionId,
  value: string | undefined,
  locale: Locale,
) {
  const spanish: Partial<Record<QuestionId, Record<string, string>>> = {
    estado_canal: {
      bloqueo_total: "te bloqueó de todos lados",
      no_contacto_explicito: "te pidió claramente que no lo contactes",
      abierto_frio:
        "puede ver tus mensajes, pero responde frío o te deja en visto",
      abierto_cortes: "responde por educación, pero nunca te busca",
      el_inicia: "él inicia algunas conversaciones y las sostiene",
      solo_logistica:
        "solo hablan por hijos, trabajo o algún asunto pendiente",
      riesgo_seguridad: "hay amenaza, miedo, acoso o un tema legal",
    },
    intento_previo: {
      texton: "mandarle un texto largo explicando todo",
      insistencia: "rogarle, insistir o llamarlo varias veces",
      contacto_cero_ciego:
        "desaparecer por completo esperando que te extrañara",
      celos_vigilancia:
        "publicar algo para darle celos o revisar sus redes",
      intimidad_intermitente:
        "acostarte con él antes de que volviera el silencio",
      sin_accion: "no hacer nada todavía y venir aquí antes de actuar",
    },
    tercera_persona: {
      otra_confirmada: "que está con otra mujer y lo sabes con certeza",
      volvio_ex: "que volvió con su ex",
      otra_sospecha: "que sospechas que hay alguien, pero no tienes pruebas",
      segunda_opcion:
        "que te busca, pero te esconde o no te da un lugar claro",
      sin_otra: "que no hay otra mujer en tu caso",
      otra_no_declara: "que prefieres no responder",
    },
    accion_urgente: {
      enviar_texton_hoy: "mandarle un mensaje largo",
      buscar_sin_avisar: "llamarlo o ir a buscarlo",
      provocar_celos_hoy: "publicar algo para que reaccione",
      vigilar_hoy: "revisar sus redes o las de ella",
      responder_si_escribe: "responder si él escribe",
      esperar_ruta: "esperar a ver tu ruta antes de moverte",
    },
  };
  const portuguese: typeof spanish = {
    estado_canal: {
      bloqueo_total: "ele bloqueou você em todos os lugares",
      no_contacto_explicito: "ele pediu claramente que você não entre em contato",
      abierto_frio:
        "ele vê suas mensagens, mas responde frio ou deixa você no vácuo",
      abierto_cortes: "ele responde por educação, mas nunca procura você",
      el_inicia: "ele inicia algumas conversas e mantém o assunto",
      solo_logistica:
        "vocês só falam sobre filhos, trabalho ou alguma pendência",
      riesgo_seguridad: "há ameaça, medo, assédio ou uma questão judicial",
    },
    intento_previo: {
      texton: "enviar um texto longo explicando tudo",
      insistencia: "implorar, insistir ou ligar várias vezes",
      contacto_cero_ciego:
        "desaparecer completamente, esperando que ele sentisse saudade",
      celos_vigilancia:
        "publicar algo para causar ciúmes ou acompanhar as redes dele",
      intimidad_intermitente:
        "ir para a cama com ele antes de o silêncio voltar",
      sin_accion: "não fazer nada e vir aqui antes de agir",
    },
    tercera_persona: {
      otra_confirmada: "que ele está com outra mulher e você tem certeza",
      volvio_ex: "que ele voltou com a ex",
      otra_sospecha: "que suspeita de alguém, mas não tem provas",
      segunda_opcion:
        "que ele procura você, mas a esconde ou não dá um lugar claro",
      sin_otra: "que não há outra mulher no seu caso",
      otra_no_declara: "que prefere não responder",
    },
    accion_urgente: {
      enviar_texton_hoy: "enviar uma mensagem longa",
      buscar_sin_avisar: "ligar ou ir procurá-lo",
      provocar_celos_hoy: "publicar algo para ele reagir",
      vigilar_hoy: "olhar as redes dele ou as dela",
      responder_si_escribe: "responder se ele escrever",
      esperar_ruta: "esperar para ver sua rota antes de agir",
    },
  };
  const english: typeof spanish = {
    estado_canal: {
      bloqueo_total: "he blocked you everywhere",
      no_contacto_explicito: "he clearly asked you not to contact him",
      abierto_frio:
        "he sees your messages, but replies coldly or leaves you on read",
      abierto_cortes: "he replies politely, but never reaches out",
      el_inicia: "he starts some conversations and keeps them going",
      solo_logistica:
        "you only talk about children, work, or unfinished business",
      riesgo_seguridad: "there are threats, fear, harassment, or a legal issue",
    },
    intento_previo: {
      texton: "send a long message explaining everything",
      insistencia: "beg, insist, or call several times",
      contacto_cero_ciego:
        "disappear completely, hoping he would miss you",
      celos_vigilancia:
        "post something to make him jealous or check his social media",
      intimidad_intermitente:
        "sleep with him before the silence returned",
      sin_accion: "do nothing yet and come here before acting",
    },
    tercera_persona: {
      otra_confirmada: "that he is with another woman and you know for certain",
      volvio_ex: "that he went back to his ex",
      otra_sospecha: "that you suspect someone else, but have no proof",
      segunda_opcion:
        "that he reaches out, but hides you or gives you no clear place",
      sin_otra: "that there is no other woman in your case",
      otra_no_declara: "that you prefer not to answer",
    },
    accion_urgente: {
      enviar_texton_hoy: "send a long message",
      buscar_sin_avisar: "call him or go find him",
      provocar_celos_hoy: "post something to make him react",
      vigilar_hoy: "check his social media or hers",
      responder_si_escribe: "reply if he writes",
      esperar_ruta: "wait to see your route before acting",
    },
  };
  const recapLabels = { en: english, es: spanish, pt: portuguese }[locale];

  return (
    recapLabels[questionId]?.[value ?? ""] ??
    getAnswerLabel(questionId, value, locale)
  );
}

export function resolveRoute(answers: QuizAnswers): QuizRoute {
  const channel = answers.estado_canal;
  const thirdPerson = answers.tercera_persona;

  if (
    channel === "no_contacto_explicito" ||
    channel === "riesgo_seguridad"
  ) {
    return "red";
  }

  if (channel === "solo_logistica") return "logistics";

  if (
    thirdPerson === "otra_confirmada" ||
    thirdPerson === "volvio_ex" ||
    thirdPerson === "segunda_opcion"
  ) {
    return "third_person";
  }

  if (channel === "bloqueo_total") return "gray";
  if (channel === "el_inicia") return "green";
  return "yellow";
}

export function resolveMainError(answers: QuizAnswers): MainError {
  const urgent = answers.accion_urgente;
  const previous = answers.intento_previo;

  if (urgent === "enviar_texton_hoy") return "texton";
  if (urgent === "buscar_sin_avisar") return "insistencia";
  if (urgent === "provocar_celos_hoy" || urgent === "vigilar_hoy") {
    return "celos_vigilancia";
  }

  if (
    previous === "texton" ||
    previous === "insistencia" ||
    previous === "contacto_cero_ciego" ||
    previous === "celos_vigilancia" ||
    previous === "intimidad_intermitente"
  ) {
    return previous;
  }

  return "none";
}

export function channelStateForRoute(route: QuizRoute) {
  const states: Record<QuizRoute, string> = {
    red: "safety",
    gray: "closed",
    yellow: "fragile",
    green: "open",
    logistics: "functional",
    third_person: "third_person",
  };

  return states[route];
}
