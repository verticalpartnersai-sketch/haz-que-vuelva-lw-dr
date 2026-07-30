import type {
  QuizCopy,
  QuizQuestion,
} from "@/features/quiz/quiz-contracts";
import { brandCopyEs } from "@/features/quiz/quiz-brand-copy";
import { previewCopyEs } from "@/features/quiz/quiz-preview-copy";
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
      "Antes de que vuelvas a escribirle, necesito saber qué está pasando entre ustedes hoy.",
    microcopy:
      "Responde por lo que él hace, no por lo que deseas que todavía sienta.",
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
      "Ya sé cuánto acceso tienes a él. Ahora necesito medir cuánto tiempo lleva aprendiendo a vivir con tu ausencia.",
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
        "El alivio de actuar puede durar segundos. La distancia que esa acción refuerza puede durar días: ese es el Bucle de Rechazo™.",
    })),
  },
  {
    id: "dominant_pain",
    title: "¿Qué es lo que más te está rompiendo por dentro ahora?",
    variant: "cards",
    options: [
      {
        image: "/images/quiz/pain/pain-silence-v1.webp",
        label: "Abrir el WhatsApp, ver su silencio y sentir el vacío que dejó",
        transition:
          "El silencio duele porque deja espacio para que tu mente invente una respuesta diferente cada hora.",
        value: "silence",
      },
      {
        image: "/images/quiz/pain/pain-replacement-v1.webp",
        label: "Imaginarlo feliz con otra mientras yo sigo esperando una señal",
        transition:
          "La comparación hace que cada movimiento de ella parezca más importante que lo que él realmente hace contigo.",
        value: "replacement",
      },
      {
        image: "/images/quiz/pain/pain-guilt-v1.webp",
        label: "Pensar que yo misma arruiné la última oportunidad por ansiedad",
        transition:
          "La culpa te empuja a explicar de más. Y cada explicación nueva puede sonar como más presión.",
        value: "guilt",
      },
      {
        image: "/images/quiz/pain/pain-second-option-v1.webp",
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
  brand: brandCopyEs,
  preview: previewCopyEs,
  intro: {
    eyebrow: "CADA DÍA QUE IMPROVISAS, ÉL APRENDE A EXTRAÑARTE MENOS",
    headline: "Él todavía no te olvidó.",
    headlineAccent:
      "Pero tu próximo error puede enseñarle a vivir sin ti.",
    subheadline:
      "Responde cinco preguntas y descubre qué está apagando su deseo, qué debes detener hoy y cómo volver a ocupar su mente antes de que la distancia se convierta en indiferencia.",
    cta: "DESCUBRIR QUÉ HACER ANTES DE PERDERLO",
    privacy:
      "Tus respuestas se usan solo para este diagnóstico. No pedimos nombre, capturas ni conversaciones.",
  },
  questions,
  loaderOne: {
    title: "Descubriendo qué lo está alejando y cuánto de tu conexión todavía sigue vivo…",
    socialProof: {
      lead: "Más de 5.732 mujeres",
      middle: "ya cambiaron la ansiedad por una ruta clara para",
      highlight: "recuperar el control y reabrir la conexión",
    },
    states: [
      "Midiendo cuánto acceso emocional todavía tienes…",
      "Identificando el error que está reforzando su distancia…",
      "Calculando el riesgo de perder la ventana que aún existe…",
      "Preparando el movimiento que debes hacer antes de volver al chat…",
    ],
    captions: [
      "No necesitas otra frase. Necesitas dejar de activar su resistencia.",
      "Tu próximo movimiento puede despertar curiosidad o confirmar su distancia.",
      "En siete días, cada decisión debe acercarte a una respuesta diferente.",
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
      "Él no necesita olvidar toda la historia para alejarse. Solo necesita asociar tu presencia con presión, ansiedad o una conversación que no quiere volver a vivir.",
      "Si repites el mismo patrón, puedes darle la última confirmación que necesita para cerrar la puerta. Haz Que Vuelva™ cambia la experiencia que él espera de ti antes de que la distancia se convierta en indiferencia, para que tu ausencia vuelva a generar curiosidad, tensión y deseo de acercarse.",
    ],
    needs: [
      "qué debes parar hoy",
      "si tu canal permite escribir, responder o esperar",
      "qué señal observar antes del próximo paso",
      "cuándo avanzar y cuándo no hacer nada",
    ],
    cta: "QUIERO IMPEDIR QUE ESTA VENTANA SE CIERRE",
    microcopy:
      "Ya identificamos lo que está jugando en tu contra. Ahora necesito saber qué quieres provocar en él.",
  },
  desire: {
    title:
      "Además de descubrir el error que lo está alejando, ¿quieres usar los próximos 7 días para hacer que tu ausencia le pese, reavivar el deseo y volver sus ganas de regresar cada vez más difíciles de ignorar?",
    options: [
      {
        label:
          "Sí. Quiero que sienta mi ausencia y vuelva a buscarme por voluntad propia",
        value: "desire_missing",
      },
      {
        label:
          "Sí. Quiero una ruta simple para despertar eso sin tener que perseguirlo",
        value: "desire_control",
      },
    ],
  },
  commitment: {
    title:
      "Si un solo impulso puede cerrar la última ventana que todavía existe, ¿te comprometes a seguir tu ruta durante 7 días antes de volver a actuar por ansiedad?",
    options: [
      {
        label: "Sí. Quiero dejar de perseguir respuestas y hacer que cada movimiento juegue a mi favor",
        value: "commit_route",
      },
      {
        label: "Sí. Quiero saber exactamente qué hacer cuando la ansiedad intente sabotearme",
        value: "commit_simple",
      },
    ],
  },
  loaderTwo: {
    title: "Construyendo los próximos 7 días para que dejes de empujarlo lejos…",
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
