import type {
  MainError,
  QuizQuestion,
  QuizRoute,
  ResultDefinition,
} from "@/features/quiz/quiz-data";

export const quizQuestionsEn: readonly QuizQuestion[] = [
  {
    id: "tiempo_ruptura",
    title: "How long has it been since the relationship ended or went cold?",
    microcopy:
      "Time does not decide whether you will get back together, but it changes what a message can trigger today.",
    transition:
      "Good. Now I need to know whether there is still a real channel between you, not the one you wish existed.",
    options: [
      { label: "Less than 7 days", value: "menos_7d", tags: ["ruptura_reciente", "urgencia_alta"] },
      { label: "Between 1 and 4 weeks", value: "1_4_semanas", tags: ["ruptura_activa"] },
      { label: "Between 1 and 3 months", value: "1_3_meses", tags: ["distancia_instalada"] },
      { label: "More than 3 months", value: "mas_3_meses", tags: ["distancia_larga"] },
      {
        label: "We did not break up, but he is cold and distant",
        value: "sin_ruptura_frio",
        tags: ["yellow_possible"],
      },
      {
        label: "We start talking again, then he pulls away",
        value: "intermitente",
        tags: ["yellow_possible", "recaida"],
      },
    ],
  },
  {
    id: "estado_canal",
    title: "What is the contact between you like today?",
    microcopy:
      "Watching your stories or unblocking you is not the same as reaching out and sustaining a conversation.",
    transition:
      "This answer matters more than any isolated “sign.” Now we need to see what happened the last time you tried to get closer.",
    options: [
      { label: "He blocked me everywhere", value: "bloqueo_total", tags: ["gray"] },
      {
        label: "He clearly asked me not to contact him",
        value: "no_contacto_explicito",
        tags: ["red"],
      },
      {
        label: "He can see my messages, but replies coldly or leaves me on read",
        value: "abierto_frio",
        tags: ["yellow"],
      },
      {
        label: "He replies to be polite, but never reaches out",
        value: "abierto_cortes",
        tags: ["yellow"],
      },
      {
        label: "He starts some conversations and keeps them going",
        value: "el_inicia",
        tags: ["green"],
      },
      {
        label: "We only talk about children, work, or unfinished business",
        value: "solo_logistica",
        tags: ["logistics"],
      },
      {
        label: "There are threats, fear, harassment, or a legal issue",
        value: "riesgo_seguridad",
        tags: ["red"],
      },
    ],
  },
  {
    id: "intento_previo",
    title: "Since he pulled away, what was the last thing you did?",
    microcopy:
      "Choose the closest answer, even if admitting it feels a little uncomfortable now.",
    transition:
      "A pattern is already emerging. Now let’s address what changes the decision most: whether there is another woman or only the fear that there is.",
    options: [
      {
        label: "I sent him a long message explaining everything",
        value: "texton",
        tags: ["presion", "main_error_texton"],
      },
      {
        label: "I begged, insisted, or called him several times",
        value: "insistencia",
        tags: ["presion", "main_error_insistencia"],
      },
      {
        label: "I disappeared completely, hoping he would miss me",
        value: "contacto_cero_ciego",
        tags: ["main_error_silencio"],
      },
      {
        label: "I posted something to make him jealous or checked his social media",
        value: "celos_vigilancia",
        tags: ["main_error_celos", "third_person_possible"],
      },
      {
        label: "We slept together, then the silence returned",
        value: "intimidad_intermitente",
        tags: ["recaida", "dignidad"],
      },
      {
        label: "I have not done anything yet; I came here before acting",
        value: "sin_accion",
        tags: ["neutral"],
      },
    ],
  },
  {
    id: "tercera_persona",
    title: "What is actually happening with the other woman?",
    microcopy:
      "A suspicion, a confirmed relationship, and being treated as a second option are not the same problem.",
    transition:
      "Understood. There is only one question left, and it may prevent your next mistake.",
    options: [
      {
        label: "He is with another woman, and I know for certain",
        value: "otra_confirmada",
        tags: ["third_person"],
      },
      { label: "He went back to his ex", value: "volvio_ex", tags: ["third_person"] },
      {
        label: "I suspect there is someone else, but I have no proof",
        value: "otra_sospecha",
        tags: ["third_person_light"],
      },
      {
        label: "He reaches out, but hides me or gives me no clear place",
        value: "segunda_opcion",
        tags: ["third_person", "dignidad"],
      },
      { label: "There is no other woman in my case", value: "sin_otra", tags: ["neutral"] },
      { label: "I prefer not to answer", value: "otra_no_declara", tags: ["neutral"] },
    ],
  },
  {
    id: "accion_urgente",
    title: "If you closed this quiz now, what would you do today?",
    microcopy:
      "Do not choose what sounds mature. Choose what you are genuinely about to do.",
    transition:
      "Done. Do not send anything yet. We will compare the state of the channel, your last attempt, and the presence of another woman.",
    options: [
      {
        label: "I would send him a long message",
        value: "enviar_texton_hoy",
        tags: ["main_error_texton"],
      },
      {
        label: "I would call him or go find him",
        value: "buscar_sin_avisar",
        tags: ["risk_escalation"],
      },
      {
        label: "I would post something to make him react",
        value: "provocar_celos_hoy",
        tags: ["main_error_celos"],
      },
      {
        label: "I would check his social media or hers",
        value: "vigilar_hoy",
        tags: ["main_error_celos"],
      },
      {
        label: "If he messaged me, I would reply",
        value: "responder_si_escribe",
        tags: ["yellow_green"],
      },
      {
        label: "I would wait to see my route before acting",
        value: "esperar_ruta",
        tags: ["neutral"],
      },
    ],
  },
];

export const loadingMessagesEn = [
  "Reviewing the channel between you...",
  "Detecting which action could push him further away...",
  "Separating facts about the other woman from what anxiety fills in...",
  "Preparing your first decision...",
] as const;

export const commonOfferItemsEn = [
  { title: "R.E.G.R.E.S.A. 7D™ Method", description: "one step a day so you can stop improvising." },
  {
    title: "Decision tree",
    description: "write, reply, or wait according to the real state of the channel.",
  },
  {
    title: "Special routes",
    description: "blocking, cold contact, openness, another woman, and required contact.",
  },
  {
    title: "Essential messages",
    description: "only with the right timing, limit, and next step.",
  },
  {
    title: "Reciprocity map",
    description: "so you do not confuse a read receipt, sex, nostalgia, or politeness with reconciliation.",
  },
  {
    title: "Final worksheet",
    description: "move forward, wait, repair, or close without continuing to lose yourself.",
  },
] as const;

export const resultsEn: Record<QuizRoute, ResultDefinition> = {
  red: {
    route: "red",
    label: "Safety first",
    headline: "Your priority today is to stop putting yourself at risk.",
    diagnosis:
      "Your answer activated a clear boundary: threats, fear, harassment, legal action, or an explicit request not to contact him. In this situation, writing from another account, using another number, asking a friend to intervene, or showing up unannounced can make things worse for both of you.",
    decisionTitle: "What to do during the next 24 hours",
    decision: "",
    safetySteps: [
      "Do not contact him.",
      "Save evidence if there are threats or harassment.",
      "Tell someone you trust.",
      "If you are in danger, seek local support, legal guidance, or emergency services.",
      "Write what you wanted to say in a private note, but do not send it.",
    ],
    closing:
      "I will not turn a safety boundary into a sales objection. Haz Que Vuelva™ is not appropriate for trying to reopen this channel now.",
    cta: "Find support and leave the quiz",
  },
  gray: {
    route: "gray",
    label: "Channel closed",
    headline: "Right now, each attempt may make him see your name and expect more pressure.",
    diagnosis:
      "The channel is closed or has no legitimate sign of openness. He may have blocked you, stopped replying, or asked for space. Sending “just one last thing” may calm you for a few minutes; to him, it may confirm that distance was the only way to breathe.",
    decisionTitle: "Your first decision",
    decision:
      "Do not look for an opening today. No other number, indirect posts, mutual friends, or “casual” phrase carrying a hidden confession. If he appears, reply briefly. If he does not, do not manufacture a sign.",
    pitch: [
      "The problem returns tomorrow, when anxiety starts bargaining with you again: “I’ll only check his profile,” “I’ll only ask how he is,” “I’ll only send this sentence.”",
      "Haz Que Vuelva™ gives you a 7-day route to break that cycle, identify whether the channel is still closed, and know exactly when to write, reply, or wait. It includes the R.E.G.R.E.S.A. 7D™ Method, the decision tree, and routes for blocking, silence, and cold contact.",
    ],
    cta: "Get my 7-day route for US$7",
    microcopy: "Immediate access · 7-day guarantee · does not teach you to bypass blocks.",
  },
  yellow: {
    route: "yellow",
    label: "Fragile channel",
    headline: "There is conversation, but one word too many could send him back into silence.",
    diagnosis:
      "He may read, reply politely, or appear from time to time. That is enough for your hope to race ahead, but not enough to talk about everything. When he gives you two lines and you give him the whole relationship, the channel becomes heavy again.",
    decisionTitle: "Your first decision",
    decision:
      "If he did not write, do not open an emotional conversation today. If he did, match his level of intensity: brief, calm, and without asking for a definition. A cold reply is not the moment to confront him about the past.",
    pitch: [
      "Your case needs sequence: how much to reply, when to stop, which sign allows you to advance, and how to distinguish politeness from interest.",
      "Haz Que Vuelva™ organizes that sequence over 7 days with the R.E.G.R.E.S.A. 7D™ Method, the openness map, and messages that only appear when your route allows contact.",
    ],
    cta: "I want to protect this opening for US$7",
    microcopy: "Immediate access · 7-day guarantee · complete method with no required extras.",
  },
  green: {
    route: "green",
    label: "There is openness",
    headline: "He reached out again. The risk now is rushing in and frightening him with everything you have held back.",
    diagnosis:
      "There is a better sign here: he initiates, asks questions, or sustains the conversation. There may be curiosity, nostalgia, or a wish to repair. You still do not know which one. Turning this opening into a talk about getting back together, promises, and defining everything can burn the moment you wanted to protect.",
    decisionTitle: "Your first decision",
    decision:
      "Match the energy he brings. If he opens something emotional, listen before demanding answers. If he suggests meeting, choose a clear context; one intense night followed by silence is not reconciliation.",
    pitch: [
      "This route has the most opportunity and, for that exact reason, needs the most precision. Haz Que Vuelva™ guides you to show change without begging, measure reciprocity, and reach a real conversation without trying to solve the entire relationship at once.",
      "You receive the R.E.G.R.E.S.A. 7D™ Method, the reciprocity scale, the Minimum Change Test, and the final decision to move forward, wait, or stop.",
    ],
    cta: "I want to protect this opportunity for US$7",
    microcopy: "Immediate access · 7-day guarantee · does not guarantee a reunion.",
  },
  logistics: {
    route: "logistics",
    label: "Required contact",
    headline: "He replies because he has to. You still do not know whether he also wants to get closer.",
    diagnosis:
      "Children, work, money, or unfinished business keep a channel open, but it is functional. Each time you mix coordination with complaints, jealousy, or nostalgia, he learns that even necessary conversations carry an emotional burden.",
    decisionTitle: "Your first decision",
    decision:
      "Reply only to the practical matter. Keep the message brief, the information clear, and the ending clean. If a separate emotional sign appears, evaluate it later; do not force it into a conversation about schedules, payments, or children.",
    pitch: [
      "Haz Que Vuelva™ shows you how to separate the functional channel from the emotional one, what to reply without seeming cold or desperate, and when an opening exists beyond obligation.",
      "The plan includes the logistics route within the R.E.G.R.E.S.A. 7D™ Method, the write / reply / wait tree, and specific boundaries so children, work, or pending matters are not used as an emotional bridge.",
    ],
    cta: "I want to separate contact and reconnection for US$7",
    microcopy: "Immediate access · 7-day guarantee · does not use third parties to pressure him.",
  },
  third_person: {
    route: "third_person",
    label: "There is another woman",
    headline: "Accepting crumbs out of fear of losing him can hurt you more than the other woman.",
    diagnosis:
      "There may be a confirmed relationship, a return to his ex, a suspicion, or a hidden place in his life where he only lets you in when he feels alone. While you watch her profile and think about competing, he keeps receiving your attention without giving you clarity.",
    decisionTitle: "Your first decision",
    decision:
      "Do not check their social media or confront her. Separate facts from assumptions. If he is with someone else, do not try to break that relationship. If he reaches out in secret or only at night, do not turn desire into proof that he chose you.",
    pitch: [
      "Your route begins by recovering your judgment before seeking connection. Haz Que Vuelva™ guides you for 7 days to step out of comparison, measure the place he actually gives you, and recognize when an opening deserves a reply and when it only keeps you as a second option.",
      "It includes the R.E.G.R.E.S.A. 7D™ Method, the third-person route, the reciprocity traffic light, and the first decision so you do not act from the fear of being replaced.",
    ],
    cta: "I want my route without competing for US$7",
    microcopy: "Immediate access · 7-day guarantee · does not teach surveillance, attacks, or breaking up relationships.",
  },
};

export const mainErrorCopyEn: Record<MainError, string> = {
  texton:
    "You are trying to resolve fear with more words. He may read pressure where you are trying to show love.",
  insistencia: "Your urgency is asking for presence when the channel needs space.",
  contacto_cero_ciego:
    "You are using silence as a bet, without knowing whether he feels your absence or is simply getting used to it.",
  celos_vigilancia:
    "The other woman is already taking up too much space in your decisions. Watching her will not restore your place; it only increases panic.",
  intimidad_intermitente:
    "The chemistry is still alive, but he is not yet showing that he wants to rebuild the relationship.",
  none:
    "You arrived before making the next mistake. That advantage is worth more than it seems.",
};
