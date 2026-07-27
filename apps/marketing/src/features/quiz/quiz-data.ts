import type {
  MainError,
  QuizQuestion,
  QuizRoute,
  ResultDefinition,
} from "./quiz-contracts";

export type {
  MainError,
  QuestionId,
  QuizAnswers,
  QuizOption,
  QuizQuestion,
  QuizRoute,
  ResultDefinition,
} from "./quiz-contracts";

export const quizQuestions: readonly QuizQuestion[] = [
  {
    id: "tiempo_ruptura",
    title:
      "¿Cuánto tiempo ha pasado desde que se rompió o se enfrió la relación?",
    microcopy:
      "El tiempo no decide si volverán, pero cambia mucho lo que un mensaje puede provocar hoy.",
    transition:
      "Bien. Ahora necesito saber si todavía existe un canal real entre ustedes, no el que te gustaría que existiera.",
    options: [
      {
        label: "Menos de 7 días",
        value: "menos_7d",
        tags: ["ruptura_reciente", "urgencia_alta"],
      },
      {
        label: "Entre 1 y 4 semanas",
        value: "1_4_semanas",
        tags: ["ruptura_activa"],
      },
      {
        label: "Entre 1 y 3 meses",
        value: "1_3_meses",
        tags: ["distancia_instalada"],
      },
      {
        label: "Más de 3 meses",
        value: "mas_3_meses",
        tags: ["distancia_larga"],
      },
      {
        label: "No terminamos, pero está frío y distante",
        value: "sin_ruptura_frio",
        tags: ["yellow_possible"],
      },
      {
        label: "Volvemos a hablar y después se aleja otra vez",
        value: "intermitente",
        tags: ["yellow_possible", "recaida"],
      },
    ],
  },
  {
    id: "estado_canal",
    title: "¿Cómo está el contacto entre ustedes hoy?",
    microcopy:
      "Que vea tus historias o te desbloquee no significa lo mismo que buscarte y sostener una conversación.",
    transition:
      "Esta respuesta pesa más que cualquier “señal” suelta. Falta ver qué ocurrió la última vez que intentaste acercarte.",
    options: [
      {
        label: "Me bloqueó de todos lados",
        value: "bloqueo_total",
        tags: ["gray"],
      },
      {
        label: "Me pidió claramente que no lo contacte",
        value: "no_contacto_explicito",
        tags: ["red"],
      },
      {
        label: "Puede ver mis mensajes, pero responde frío o me deja en visto",
        value: "abierto_frio",
        tags: ["yellow"],
      },
      {
        label: "Responde por educación, pero nunca me busca",
        value: "abierto_cortes",
        tags: ["yellow"],
      },
      {
        label: "Él inicia algunas conversaciones y las sostiene",
        value: "el_inicia",
        tags: ["green"],
      },
      {
        label: "Solo hablamos por hijos, trabajo o algo pendiente",
        value: "solo_logistica",
        tags: ["logistics"],
      },
      {
        label: "Hay amenaza, miedo, acoso o un tema legal",
        value: "riesgo_seguridad",
        tags: ["red"],
      },
    ],
  },
  {
    id: "intento_previo",
    title: "Desde que se alejó, ¿qué fue lo último que hiciste?",
    microcopy:
      "Elige la opción que más se parece, aunque ahora te dé un poco de pena admitirlo.",
    transition:
      "Ya aparece un patrón. Ahora vamos a tocar la parte que más cambia una decisión: si existe otra mujer o solo el miedo de que exista.",
    options: [
      {
        label: "Le mandé un texto largo explicando todo",
        value: "texton",
        tags: ["presion", "main_error_texton"],
      },
      {
        label: "Le rogué, insistí o lo llamé varias veces",
        value: "insistencia",
        tags: ["presion", "main_error_insistencia"],
      },
      {
        label: "Desaparecí por completo esperando que me extrañara",
        value: "contacto_cero_ciego",
        tags: ["main_error_silencio"],
      },
      {
        label: "Publiqué algo para darle celos o revisé sus redes",
        value: "celos_vigilancia",
        tags: ["main_error_celos", "third_person_possible"],
      },
      {
        label: "Terminamos en la cama y después volvió el silencio",
        value: "intimidad_intermitente",
        tags: ["recaida", "dignidad"],
      },
      {
        label: "No hice nada todavía; estoy aquí antes de actuar",
        value: "sin_accion",
        tags: ["neutral"],
      },
    ],
  },
  {
    id: "tercera_persona",
    title: "Sobre otra mujer, ¿qué está pasando de verdad?",
    microcopy:
      "Una sospecha, una relación confirmada y ser tratada como segunda opción no son el mismo problema.",
    transition:
      "Entiendo. Falta una sola pregunta, y es la que puede evitar el próximo error.",
    options: [
      {
        label: "Está con otra mujer y lo sé con certeza",
        value: "otra_confirmada",
        tags: ["third_person"],
      },
      {
        label: "Volvió con su ex",
        value: "volvio_ex",
        tags: ["third_person"],
      },
      {
        label: "Sospecho que hay alguien, pero no tengo pruebas",
        value: "otra_sospecha",
        tags: ["third_person_light"],
      },
      {
        label: "Me busca, pero me esconde o no me da un lugar claro",
        value: "segunda_opcion",
        tags: ["third_person", "dignidad"],
      },
      {
        label: "No hay otra mujer en mi caso",
        value: "sin_otra",
        tags: ["neutral"],
      },
      {
        label: "Prefiero no responder",
        value: "otra_no_declara",
        tags: ["neutral"],
      },
    ],
  },
  {
    id: "accion_urgente",
    title: "Si cerraras este quiz ahora, ¿qué harías hoy?",
    microcopy:
      "No elijas lo que suena maduro. Elige lo que de verdad estás a punto de hacer.",
    transition:
      "Listo. No envíes nada todavía. Vamos a cruzar el estado del canal, tu último intento y la presencia de otra mujer.",
    options: [
      {
        label: "Le mandaría un mensaje largo",
        value: "enviar_texton_hoy",
        tags: ["main_error_texton"],
      },
      {
        label: "Lo llamaría o iría a buscarlo",
        value: "buscar_sin_avisar",
        tags: ["risk_escalation"],
      },
      {
        label: "Publicaría algo para que reaccione",
        value: "provocar_celos_hoy",
        tags: ["main_error_celos"],
      },
      {
        label: "Revisaría sus redes o las de ella",
        value: "vigilar_hoy",
        tags: ["main_error_celos"],
      },
      {
        label: "Si él escribe, le respondería",
        value: "responder_si_escribe",
        tags: ["yellow_green"],
      },
      {
        label: "Esperaría a ver mi ruta antes de moverme",
        value: "esperar_ruta",
        tags: ["neutral"],
      },
    ],
  },
];

export const loadingMessages = [
  "Revisando cómo está el canal entre ustedes...",
  "Detectando qué acción puede alejarlo más...",
  "Separando hechos sobre la otra mujer de lo que completa la ansiedad...",
  "Preparando tu primera decisión...",
] as const;

export const commonOfferItems = [
  {
    title: "Método R.E.G.R.E.S.A. 7D™",
    description: "un paso por día para dejar de improvisar.",
  },
  {
    title: "Árbol de decisión",
    description:
      "escribir, responder o esperar según el estado real del canal.",
  },
  {
    title: "Rutas especiales",
    description:
      "bloqueo, contacto frío, apertura, otra mujer y contacto obligatorio.",
  },
  {
    title: "Mensajes esenciales",
    description: "solo con momento de uso, límite y siguiente paso.",
  },
  {
    title: "Mapa de reciprocidad",
    description:
      "para no confundir visto, sexo, nostalgia o cortesía con una reconciliación.",
  },
  {
    title: "Hoja final",
    description: "avanzar, esperar, reparar o cerrar sin seguir perdiéndote.",
  },
] as const;

export const results: Record<QuizRoute, ResultDefinition> = {
  red: {
    route: "red",
    label: "Seguridad primero",
    headline: "Hoy tu prioridad es dejar de ponerte en riesgo.",
    diagnosis:
      "Tu respuesta activó un límite claro: amenaza, miedo, acoso, medida legal o que él te pidió claramente que no lo contactes. En este escenario, escribir desde otra cuenta, usar otro número, pedirle ayuda a un amigo o aparecer sin avisar puede empeorar la situación para los dos.",
    decisionTitle: "Lo que debes hacer durante las próximas 24 horas",
    decision: "",
    safetySteps: [
      "No lo contactes.",
      "Guarda evidencia si hay amenaza o acoso.",
      "Cuéntaselo a una persona de confianza.",
      "Si hay peligro, busca apoyo local, orientación legal o servicios de emergencia.",
      "Escribe lo que querías decir en una nota privada, pero no lo envíes.",
    ],
    closing:
      "No voy a convertir un límite de seguridad en una objeción de venta. Haz Que Vuelva™ no está indicado para intentar reabrir este canal ahora.",
    cta: "Buscar apoyo y salir del quiz",
  },
  gray: {
    route: "gray",
    label: "Canal cerrado",
    headline:
      "Ahora mismo, cada intento puede hacer que él vea tu nombre y ya espere más presión.",
    diagnosis:
      "El canal está cerrado o no tiene una señal legítima de apertura. Tal vez te bloqueó, dejó de responder o pidió espacio. El impulso de mandar “solo una última cosa” te calma durante unos minutos; para él puede confirmar que alejarse era la única manera de respirar.",
    decisionTitle: "Tu primera decisión",
    decision:
      "No busques una entrada hoy. Nada de otro número, indirectas, amigos en común o una frase “casual” que lleva una confesión escondida. Si él aparece, responde breve. Si no aparece, no fabriques la señal.",
    pitch: [
      "El problema llega mañana, cuando la ansiedad vuelva a negociar contigo: “solo miro su perfil”, “solo le pregunto cómo está”, “solo mando esta frase”.",
      "Haz Que Vuelva™ te entrega una ruta de 7 días para cortar ese ciclo, identificar si el canal sigue cerrado y saber exactamente cuándo escribir, responder o esperar. Incluye el Método R.E.G.R.E.S.A. 7D™, el árbol de decisión y las rutas para bloqueo, silencio y contacto frío.",
    ],
    cta: "Acceder a mi ruta de 7 días por US$7",
    microcopy:
      "Acceso inmediato · garantía de 7 días · no enseña a romper bloqueos.",
  },
  yellow: {
    route: "yellow",
    label: "Canal frágil",
    headline:
      "Hay conversación, pero una palabra de más puede devolverlo al silencio.",
    diagnosis:
      "Él puede leer, responder por educación o aparecer de vez en cuando. Eso alcanza para que tu esperanza corra, pero todavía no alcanza para hablar de todo. Cuando él entrega dos líneas y tú entregas toda la relación, el canal queda pesado otra vez.",
    decisionTitle: "Tu primera decisión",
    decision:
      "Si no escribió, no abras una conversación emocional hoy. Si escribió, responde al mismo nivel de intensidad: breve, tranquila y sin pedir una definición. Una respuesta fría no es el momento de reclamarle el pasado.",
    pitch: [
      "Tu caso necesita secuencia: cuánto responder, cuándo frenar, qué señal permite avanzar y cómo distinguir cortesía de interés.",
      "Haz Que Vuelva™ organiza esa secuencia durante 7 días con el Método R.E.G.R.E.S.A. 7D™, el mapa de apertura y mensajes que solo aparecen cuando tu ruta permite contacto.",
    ],
    cta: "Quiero proteger esta apertura por US$7",
    microcopy:
      "Acceso inmediato · garantía de 7 días · método completo sin extras obligatorios.",
  },
  green: {
    route: "green",
    label: "Hay apertura",
    headline:
      "Él volvió a buscarte. El riesgo ahora es correr y asustarlo con todo lo que llevas guardado.",
    diagnosis:
      "Aquí hay una señal mejor: él inicia, pregunta o sostiene la conversación. Puede existir curiosidad, nostalgia o deseo de reparar. Todavía no sabes cuál de las tres. Si conviertes esa apertura en una charla sobre volver, prometer y definirlo todo, puedes quemar el momento que querías cuidar.",
    decisionTitle: "Tu primera decisión",
    decision:
      "Responde con la misma energía que él trae. Si abre algo emocional, escucha antes de cobrar. Si propone verse, busca un contexto claro; una noche intensa seguida de silencio no es reconciliación.",
    pitch: [
      "Esta es la ruta con más oportunidad y, justamente por eso, necesita más precisión. Haz Que Vuelva™ te guía para mostrar cambio sin implorar, medir reciprocidad y llegar a una conversación real sin intentar resolver toda la relación de golpe.",
      "Recibes el Método R.E.G.R.E.S.A. 7D™, la escala de reciprocidad, la Prueba Mínima de Cambio y la decisión final para avanzar, esperar o parar.",
    ],
    cta: "Quiero cuidar esta oportunidad por US$7",
    microcopy:
      "Acceso inmediato · garantía de 7 días · no garantiza regreso.",
  },
  logistics: {
    route: "logistics",
    label: "Contacto obligatorio",
    headline:
      "Te responde porque tiene que hacerlo. Todavía no sabes si también quiere acercarse.",
    diagnosis:
      "Hijos, trabajo, dinero o asuntos pendientes mantienen un canal abierto, pero ese canal es funcional. Cada vez que mezclas una coordinación con reclamos, celos o nostalgia, él aprende que hasta hablar de lo necesario trae una carga emocional.",
    decisionTitle: "Tu primera decisión",
    decision:
      "Responde solo al asunto práctico. Mensaje breve, información clara y cierre limpio. Si aparece una señal emocional separada, se evalúa después; no la fuerces dentro de una conversación sobre horarios, pagos o hijos.",
    pitch: [
      "Haz Que Vuelva™ te muestra cómo separar el canal funcional del emocional, qué responder sin parecer fría ni desesperada y cuándo existe una apertura que no depende de la obligación.",
      "El plan incluye la ruta logística dentro del Método R.E.G.R.E.S.A. 7D™, el árbol escribir / responder / esperar y límites específicos para no usar hijos, trabajo o pendientes como puente emocional.",
    ],
    cta: "Quiero separar contacto y reconexión por US$7",
    microcopy:
      "Acceso inmediato · garantía de 7 días · no usa terceros para presionar.",
  },
  third_person: {
    route: "third_person",
    label: "Hay otra mujer",
    headline:
      "Aceptar migajas por miedo a perderlo puede dañarte más que la otra mujer.",
    diagnosis:
      "Puede haber una relación confirmada, una vuelta con la ex, una sospecha o un lugar escondido en su vida al que solo te deja entrar cuando se siente solo. Mientras miras el perfil de ella y piensas cómo competir, él sigue recibiendo tu atención sin darte claridad.",
    decisionTitle: "Tu primera decisión",
    decision:
      "No revises sus redes ni la enfrentes. Separa hechos de suposiciones. Si él está con otra persona, no intentes romper esa relación. Si te busca a escondidas o solo de noche, no conviertas deseo en prueba de que te eligió.",
    pitch: [
      "Tu ruta empieza recuperando tu criterio antes de buscar conexión. Haz Que Vuelva™ te guía durante 7 días para salir de la comparación, medir el lugar que él realmente te da y reconocer cuándo una apertura merece respuesta y cuándo solo te mantiene como segunda opción.",
      "Incluye el Método R.E.G.R.E.S.A. 7D™, la ruta de tercera persona, el semáforo de reciprocidad y la primera decisión para no actuar desde el miedo de ser reemplazada.",
    ],
    cta: "Quiero mi ruta sin competir por US$7",
    microcopy:
      "Acceso inmediato · garantía de 7 días · no enseña a vigilar, atacar ni romper relaciones.",
  },
};

export const mainErrorCopy: Record<MainError, string> = {
  texton:
    "Estás intentando resolver el miedo con más palabras. Él puede leer presión donde tú estás intentando mostrar amor.",
  insistencia:
    "Tu urgencia está pidiendo presencia cuando el canal necesita espacio.",
  contacto_cero_ciego:
    "Estás usando silencio como apuesta, sin saber si él siente ausencia o simplemente se acostumbra a ella.",
  celos_vigilancia:
    "La otra mujer ya está ocupando demasiado espacio en tus decisiones. Vigilarla no te devuelve tu lugar; solo aumenta el pánico.",
  intimidad_intermitente:
    "La química sigue viva, pero él todavía no está mostrando que quiera reconstruir la relación.",
  none:
    "Llegaste antes de cometer el siguiente error. Esa ventaja vale más de lo que parece.",
};
