import type { Locale } from "@/features/i18n/locale";
import type {
  CurrentState,
  DominantPain,
  LastAction,
  QuizAnswers,
  QuizRoute,
} from "@/features/quiz/quiz-contracts";

export type QuizNotificationBeat = "channel" | "impact" | "signal" | "opening";

export type QuizNotificationContent = {
  body: string;
  id: QuizNotificationBeat;
  sender: string;
  timeLabel: string;
};

const sender: Record<Locale, string> = { en: "Him", es: "Él", pt: "Ele" };
const timeLabel: Record<Locale, string> = {
  en: "now",
  es: "ahora",
  pt: "agora",
};

const channelMessages: Record<
  Locale,
  Partial<Record<CurrentState, string>>
> = {
  en: {
    cold_contact: "Hey… can we talk later?",
    green_contact: "Something reminded me of you today. How are you?",
    intermittent: "Are you awake?",
    logistics: "What time can we sort out what is still pending?",
    third_person: "I hope you're doing well.",
  },
  es: {
    cold_contact: "Hola… ¿podemos hablar después?",
    green_contact: "Me acordé de ti hoy. ¿Cómo estás?",
    intermittent: "¿Estás despierta?",
    logistics: "¿A qué hora resolvemos lo que quedó pendiente?",
    third_person: "Espero que estés bien.",
  },
  pt: {
    cold_contact: "Oi… podemos conversar depois?",
    green_contact: "Lembrei de você hoje. Como você está?",
    intermittent: "Você está acordada?",
    logistics: "Que horas resolvemos o que ficou pendente?",
    third_person: "Espero que você esteja bem.",
  },
};

const impactMessages: Record<Locale, Record<LastAction, string>> = {
  en: {
    blind_silence: "It's been days since I heard from you…",
    insistence: "I don't know what to say right now. I need some space.",
    intimacy: "Yesterday mattered, but I still don't know what I want.",
    jealousy: "I saw what you posted. I don't know if it was about me.",
    long_message: "I read everything you wrote. I need time to think.",
    pause: "Hey… something reminded me of you today.",
  },
  es: {
    blind_silence: "Hace días que no sé nada de ti…",
    insistence: "No sé qué responder ahora. Necesito un poco de espacio.",
    intimacy: "Ayer fue importante, pero todavía no sé qué quiero.",
    jealousy: "Vi lo que publicaste. No sé si era para mí.",
    long_message: "Leí todo lo que escribiste. Necesito tiempo para pensar.",
    pause: "Hola… me acordé de ti hoy.",
  },
  pt: {
    blind_silence: "Já faz alguns dias que não sei nada de você…",
    insistence: "Não sei o que responder agora. Preciso de um pouco de espaço.",
    intimacy: "Ontem foi importante, mas ainda não sei o que quero.",
    jealousy: "Vi o que você publicou. Não sei se era para mim.",
    long_message: "Li tudo o que você escreveu. Preciso de tempo para pensar.",
    pause: "Oi… lembrei de você hoje.",
  },
};

const signalMessages: Record<Locale, Record<DominantPain, string>> = {
  en: {
    guilt: "I saw your messages. I need a little space.",
    replacement: "I don't know what I want, but I didn't want to lose you completely.",
    second_option: "Are you awake? I wanted to see you.",
    silence: "Sorry I disappeared. I've been thinking.",
  },
  es: {
    guilt: "Vi tus mensajes. Necesito un poco de espacio.",
    replacement: "No sé qué quiero, pero no quería perderte del todo.",
    second_option: "¿Estás despierta? Quería verte.",
    silence: "Perdón por desaparecer. He estado pensando.",
  },
  pt: {
    guilt: "Vi suas mensagens. Preciso de um pouco de espaço.",
    replacement: "Não sei o que quero, mas não queria perder você de vez.",
    second_option: "Você está acordada? Queria ver você.",
    silence: "Desculpa ter desaparecido. Estive pensando.",
  },
};

const openingMessages: Record<
  Locale,
  Partial<Record<QuizRoute, string>>
> = {
  en: {
    green: "Can we talk this week? I'll call you.",
    logistics: "After we sort this out, can we talk for a moment?",
    yellow: "Something reminded me of you today. How are you?",
  },
  es: {
    green: "¿Podemos hablar esta semana? Yo te llamo.",
    logistics: "Después de resolver esto, ¿podemos hablar un momento?",
    yellow: "Me acordé de ti hoy. ¿Cómo estás?",
  },
  pt: {
    green: "Podemos conversar esta semana? Eu ligo para você.",
    logistics: "Depois de resolvermos isso, podemos conversar um pouco?",
    yellow: "Lembrei de você hoje. Como você está?",
  },
};

function canShowMessage(answers: QuizAnswers) {
  return (
    answers.current_state !== "blocked" &&
    answers.current_state !== "explicit_stop"
  );
}

export function notificationContentFor({
  answers,
  beat,
  locale,
  route,
}: {
  answers: QuizAnswers;
  beat: QuizNotificationBeat;
  locale: Locale;
  route: QuizRoute;
}): QuizNotificationContent | null {
  if (!canShowMessage(answers)) return null;

  let body: string | undefined;
  if (beat === "channel" && answers.current_state) {
    body = channelMessages[locale][answers.current_state];
  }
  if (beat === "impact" && answers.last_action) {
    body = impactMessages[locale][answers.last_action];
  }
  if (beat === "signal" && answers.dominant_pain) {
    body = signalMessages[locale][answers.dominant_pain];
  }
  if (beat === "opening") body = openingMessages[locale][route];
  if (!body) return null;

  return { body, id: beat, sender: sender[locale], timeLabel: timeLabel[locale] };
}
