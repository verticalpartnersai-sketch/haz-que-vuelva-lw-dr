import type {
  QuizCopy,
  QuizQuestion,
} from "@/features/quiz/quiz-contracts";
import { resultCopyEs } from "@/features/quiz/quiz-results";

export type {
  CurrentState,
  DesireCommitment,
  DistanceBand,
  DistanceTime,
  DominantFear,
  DominantPain,
  ExecutionCommitment,
  LastAction,
  QuestionId,
  QuizAnswers,
  QuizOption,
  QuizQuestion,
  QuizRoute,
  QuizStage,
} from "@/features/quiz/quiz-contracts";

const questions: readonly QuizQuestion[] = [
  {
    id: "current_state",
    title:
      "Para preparar una ruta para tu caso, ¿cómo está la situación entre ustedes hoy?",
    microcopy:
      "Tus respuestas se usan solo para organizar este diagnóstico. No necesitas subir conversaciones ni contar tu nombre.",
    options: [
      {
        label:
          "Todavía hablamos, pero él está frío, distante o responde cada vez menos",
        value: "cold_contact",
      },
      {
        label: "Me bloqueó, dejó de responder o desapareció por completo",
        value: "blocked",
      },
      {
        label:
          "Hay otra mujer, volvió con su ex o siento que me está reemplazando",
        value: "third_person",
      },
      {
        label: "Me busca, se acerca y después vuelve a desaparecer",
        value: "intermittent",
      },
      {
        label:
          "Volvió a iniciar conversaciones y mantiene el contacto sin que yo tenga que empujarlo",
        value: "green_contact",
      },
      {
        label:
          "Solo hablamos por hijos, trabajo, dinero o algo que tenemos que resolver",
        value: "logistics",
      },
      {
        label:
          "Me pidió claramente que no lo contacte, tengo miedo o existe una restricción legal",
        value: "explicit_stop",
      },
    ],
  },
  {
    context:
      "Ya detectamos el estado del canal. Ahora vamos a medir cuánto tiempo lleva acumulándose la distancia.",
    id: "distance_time",
    title: "¿Cuánto tiempo lleva fría, rota o interrumpida la relación?",
    options: [
      {
        label: "Menos de 7 días",
        transition:
          "Todavía estás en la fase en que una reacción impulsiva puede cambiar el tono de todo.",
        value: "lt_7d",
      },
      {
        label: "Entre 1 y 4 semanas",
        transition:
          "La distancia ya creó una nueva rutina. Lo que hagas ahora necesita romper el patrón, no repetirlo.",
        value: "1_4w",
      },
      {
        label: "Entre 1 y 3 meses",
        transition:
          "A esta altura, insistir con la misma estrategia solo confirma la imagen que él ya está evitando.",
        value: "1_3m",
      },
      {
        label: "Más de 3 meses",
        transition:
          "Después de meses, la clave no es mandar más. Es crear una experiencia diferente y observar si existe apertura real.",
        value: "gt_3m",
      },
    ],
  },
  {
    id: "last_action",
    title:
      "Desde que él se alejó, ¿cuál de estas acciones se parece más a lo que hiciste?",
    options: [
      {
        label:
          "Le envié un mensaje largo, le expliqué todo o le pedí otra oportunidad",
        value: "long_message",
      },
      {
        label:
          "Insistí, cobré una respuesta o volví a escribir después de que no contestó",
        value: "insistence",
      },
      {
        label:
          "Desaparecí por completo porque me dijeron que el contacto cero siempre funciona",
        value: "blind_silence",
      },
      {
        label:
          "Publiqué indirectas, intenté darle celos o mostrar que ya lo superé",
        value: "jealousy",
      },
      {
        label:
          "Volvimos a vernos o a tener intimidad, pero después él se enfrió otra vez",
        value: "intimacy",
      },
      {
        label: "Todavía no hice nada; estoy aquí antes de cometer otro error",
        value: "pause",
      },
    ].map((option) => ({
      ...option,
      transition:
        "Esa acción no define tu historia, pero puede estar alimentando el Bucle de Rechazo™ que mantiene el canal frío.",
    })),
  },
  {
    id: "dominant_pain",
    title: "¿Qué es lo que más te está rompiendo por dentro ahora?",
    variant: "cards",
    options: [
      {
        emoji: "◌",
        label: "Abrir el WhatsApp, ver su silencio y sentir el vacío que dejó",
        transition:
          "El silencio duele porque deja espacio para que tu mente invente una respuesta diferente cada hora.",
        value: "silence",
      },
      {
        emoji: "◇",
        label: "Imaginarlo feliz con otra mientras yo sigo esperando una señal",
        transition:
          "La comparación hace que cada movimiento de ella parezca más importante que lo que él realmente hace contigo.",
        value: "replacement",
      },
      {
        emoji: "↯",
        label: "Pensar que yo misma arruiné la última oportunidad por ansiedad",
        transition:
          "La culpa te empuja a explicar de más. Y cada explicación nueva puede sonar como más presión.",
        value: "guilt",
      },
      {
        emoji: "↺",
        label: "Que vuelva cuando se siente solo, pero nunca me elija de verdad",
        transition:
          "Que vuelva por nostalgia o soledad no significa que esté dispuesto a reparar la relación.",
        value: "second_option",
      },
    ],
  },
  {
    id: "dominant_fear",
    title:
      "Si sigues actuando como hasta ahora, ¿qué es lo que más temes que pase?",
    options: [
      {
        emoji: "😔",
        label: "Que me olvide y nuestra historia deje de significar algo para él",
        value: "forgotten",
      },
      {
        emoji: "💔",
        label: "Que se enamore de otra y yo llegue demasiado tarde",
        value: "other_woman",
      },
      {
        emoji: "⏳",
        label: "Que la última ventana de contacto se cierre por completo",
        value: "closed_window",
      },
      {
        emoji: "🔁",
        label:
          "Que vuelva una noche, desaparezca otra vez y yo siga atrapada en lo mismo",
        value: "repeat_cycle",
      },
    ].map((option) => ({
      ...option,
      transition:
        "Ya tenemos lo necesario. Vamos a cruzar el canal, el tiempo y tu última acción.",
    })),
  },
];

export const quizCopyEs: QuizCopy = {
  intro: {
    eyebrow: "DIAGNÓSTICO PRIVADO DE RECONEXIÓN · 2 MINUTOS",
    headline:
      "Descubre qué está haciendo que él se aleje… y cómo abrir una nueva Ventana de Memoria Afectiva™.",
    subheadline:
      "Responde cinco preguntas. Verás qué está cerrando la puerta, qué error debes parar hoy y la primera decisión de tu protocolo de 7 días.",
    cta: "Descubrir qué está pasando",
    privacy:
      "Tus respuestas se usan solo para este diagnóstico. No pedimos nombre, capturas ni conversaciones.",
  },
  questions,
  loaderOne: {
    title: "Analizando tu caso y el estado real del contacto…",
    states: [
      "Leyendo el estado del canal…",
      "Identificando el Bucle de Rechazo™ activo…",
      "Calculando tu Índice de Distancia Emocional…",
      "Preparando la primera decisión para tu caso…",
    ],
    captions: [
      "Tu caso no recibe una regla universal. Recibe una ruta.",
      "Antes del mensaje viene la decisión.",
      "Siete días, una acción por vez.",
    ],
  },
  prediagnosis: {
    alert: "¡ANÁLISIS INICIAL COMPLETADO!",
    scoreTitle: "Índice de Distancia Emocional",
    scoreSubtitle:
      "Según el estado del canal, el tiempo y la presión de tu última acción.",
    loop: [
      "silencio o señal ambigua",
      "ansiedad",
      "mensaje, presión, celos o desaparición teatral",
      "más distancia",
      "más urgencia para corregir",
      "repetición",
    ],
    bodyAfterLoop: [
      "La salida no empieza con una frase mágica. Empieza cuando cambias la experiencia reciente que él asocia contigo dentro de la Ventana de Memoria Afectiva™.",
      "Este modelo no lee su mente: te ayuda a evitar que una nueva interacción repita la presión que él ya está evitando.",
    ],
    needs: [
      "qué debes parar hoy",
      "si tu canal permite escribir, responder o esperar",
      "qué señal observar antes del próximo paso",
      "cuándo avanzar y cuándo no hacer nada",
    ],
    cta: "QUIERO VER CÓMO REABRIR MI VENTANA",
    microcopy:
      "Tu resultado completo ya está siendo preparado. Primero necesito saber qué cambio quieres provocar.",
  },
  desire: {
    title:
      "Además de saber qué debes parar hoy, ¿quieres usar los próximos 7 días para dejar de reforzar presión y volver a crear curiosidad y apertura?",
    options: [
      {
        label:
          "Sí. Quiero que vuelva a sentir mi ausencia y ganas de acercarse",
        value: "desire_missing",
      },
      {
        label:
          "Sí. Quiero una ruta directa para no volver a perderlo por ansiedad",
        value: "desire_control",
      },
    ],
  },
  commitment: {
    title:
      "Tu protocolo puede decirte que escribas, respondas o esperes. ¿Te comprometes a seguir la ruta durante 7 días, incluso cuando tu ansiedad quiera otra cosa?",
    options: [
      {
        label: "Sí. Quiero dejar de improvisar y seguir una decisión por día",
        value: "commit_route",
      },
      {
        label: "Sí. Pero necesito que sea simple, directo y aplicable desde hoy",
        value: "commit_simple",
      },
    ],
  },
  loaderTwo: {
    title: "Creando tu ruta inicial de 7 días…",
    states: [
      "Separando señales reales de interpretaciones…",
      "Definiendo qué debes parar hoy…",
      "Cruzando tu ruta con el Método R.E.G.R.E.S.A. 7D™…",
      "Preparando tu primera decisión de 24 horas…",
    ],
    captions: [
      "Día 1 · Regula: deja de actuar para aliviar la ansiedad.",
      "Día 2 · Examina: identifica la ruta y el estado del canal.",
      "Día 3 · Genera: produce un cambio pequeño y observable.",
      "Días 4–7: reabre cuando existe canal, mide reciprocidad y decide.",
    ],
  },
  painImpulses: {
    silence: {
      sentence: "el silencio y el vacío que dejó",
      impulse: "buscar una respuesta que calme la incertidumbre ahora",
    },
    replacement: {
      sentence: "el miedo de estar siendo reemplazada",
      impulse: "compararte, vigilar o intentar provocar una reacción",
    },
    guilt: {
      sentence: "la culpa por lo que hiciste",
      impulse: "explicar de más para corregir todo en un solo mensaje",
    },
    second_option: {
      sentence: "el miedo de seguir siendo su segunda opción",
      impulse: "aceptar una aparición sin exigir consistencia",
    },
  },
  ...resultCopyEs,
};
