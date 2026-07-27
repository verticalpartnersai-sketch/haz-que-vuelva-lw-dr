import type { QuizCopy } from "@/features/quiz/quiz-contracts";

type ResultCopy = Pick<
  QuizCopy,
  "demonstration" | "faq" | "pitch" | "result" | "routes" | "summaries" | "ui"
>;

export const resultCopyEs: ResultCopy = {
  demonstration: {
    headline:
      "No necesitas tener un caso fácil. Necesitas dejar de usar la misma respuesta para situaciones completamente diferentes.",
    subheadline:
      "Mira por qué un solo consejo puede ayudar a una mujer y destruir la oportunidad de otra.",
    cases: [
      {
        eyebrow: "CASO · BLOQUEO",
        description:
          "Él la bloqueó después de tres mensajes seguidos. Mandar una cuarta explicación no demuestra amor: refuerza la presión que él intentó cortar.",
        decision:
          "Retirar presión, dejar de buscar atajos y preparar una reapertura solo si el canal vuelve a ser legítimo.",
        proof: "routes",
      },
      {
        eyebrow: "CASO · CONTACTO FRÍO",
        description:
          "Él todavía responde, pero con frases cortas y sin iniciar. Desaparecer 30 días por regla puede matar el poco contexto que existe. Cobrar interés también.",
        decision:
          "Igualar intensidad, responder sin forzar una definición y observar si él invierte espontáneamente.",
        proof: "scale",
      },
      {
        eyebrow: "CASO · OTRA MUJER",
        description:
          "Existe otra mujer y tú estás mirando cada historia, comparación y señal. Competir o provocar celos hace que ella dirija toda tu estrategia.",
        decision:
          "Separar hechos de sospechas, detener la triangulación y medir solo lo que él ofrece de forma directa.",
        proof: "decision",
      },
    ],
    dynamicLabels: [
      "Tu ruta inicial",
      "El error que más puede cerrarla",
      "La primera decisión que vamos a preparar",
    ],
    cta: "QUIERO UNA RUTA PARA MI CASO",
  },
  result: {
    confirmation: "¡TU DIAGNÓSTICO INICIAL ESTÁ LISTO!",
    titlePrefix: "Tu ruta es",
    labels: {
      contact: "Estado del contacto",
      distance: "Tiempo de distancia",
      action: "Acción que más presión agregó",
      pain: "Dolor que está dirigiendo tus impulsos",
      index: "Índice de Distancia Emocional",
    },
    disclaimer:
      "Este número no mide amor ni garantiza que él vuelva. Muestra cuánta distancia y presión declaraste para elegir una acción proporcional.",
    timelineTitle: "Lo que sí puede cambiar desde hoy",
    timeline: [
      {
        label: "HOY",
        text: "Identificas el error y paras la acción que aumenta distancia.",
      },
      {
        label: "24 HORAS",
        text: "Ejecutas una primera decisión compatible con tu ruta.",
      },
      {
        label: "DÍAS 2–5",
        text: "Observas canal y reciprocidad sin inventar significados.",
      },
      {
        label: "DÍA 7",
        text: "Decides si escribir, responder, esperar o salir del ciclo.",
      },
    ],
  },
  routes: {
    gray: {
      publicName: "Puerta cerrada",
      prediagnosisHeadline:
        "Tu caso no necesita otra explicación. Necesita retirar presión antes de que el silencio se convierta en rechazo definitivo.",
      headline:
        "Él está cerrando el canal. Insistir ahora puede convertir distancia en rechazo.",
      diagnosis: [
        "Tu situación no se resuelve con un mensaje más convincente. Cuando hay bloqueo o silencio completo, cada intento por otra red, número o persona puede confirmar que alejarse fue la única forma de detener la presión.",
        "La primera victoria no es obtener una respuesta; es dejar de producir nuevas razones para que él se proteja de ti.",
      ],
      firstAction:
        "No buscar un canal alternativo. No enviar otra explicación. Registrar qué disparó el último intento y preparar una pausa con criterio.",
      bridge:
        "Haz Que Vuelva™ te muestra cómo atravesar los próximos siete días sin perseguirlo y cómo reconocer una apertura legítima.",
      cta: "QUIERO MI RUTA PARA DEJAR DE CERRAR LA PUERTA",
    },
    yellow: {
      publicName: "Canal frágil",
      prediagnosisHeadline:
        "Todavía existe un canal, pero está tan frágil que un mensaje ansioso puede cerrarlo.",
      headline:
        "Todavía existe contacto. Pero él está midiendo cuánto espacio tendrá si vuelve a acercarse.",
      diagnosis: [
        "Una respuesta corta, una visualización o un “hola” no significan que la relación volvió. Tampoco significan que debas desaparecer por 30 días.",
        "Tu oportunidad está en igualar la intensidad que él ofrece y dejar que la próxima señal venga de una inversión observable.",
      ],
      firstAction:
        "Reducir tu próximo movimiento al tamaño real del canal. Si él no preguntó nada, no convertir una respuesta fría en otra conversación forzada.",
      bridge:
        "Haz Que Vuelva™ organiza cuándo responder, cuándo cerrar con ligereza y qué señal necesita aparecer antes de avanzar.",
      cta: "QUIERO PROTEGER EL CANAL QUE TODAVÍA EXISTE",
    },
    green: {
      publicName: "Apertura real",
      prediagnosisHeadline:
        "Hay apertura observable. Tu mayor riesgo ahora es acelerar y pedir una definición antes de tiempo.",
      headline:
        "Hay una apertura observable. Tu mayor peligro ahora es querer convertirla en una definición inmediata.",
      diagnosis: [
        "Él inicia, sostiene o muestra curiosidad. Eso es mejor que la simple cortesía, pero todavía no es reparación.",
        "Si pides garantías o todo el pasado resuelto antes de que exista consistencia, puedes transformar curiosidad en nueva presión.",
      ],
      firstAction:
        "Responder con proporción, no abrir toda la historia de una vez y observar si él sostiene el próximo movimiento sin ser empujado.",
      bridge:
        "Haz Que Vuelva™ entrega la escala R0–R4 para diferenciar apertura, inversión y reparación.",
      cta: "QUIERO SABER CÓMO AVANZAR SIN ACELERARLO",
    },
    third_person: {
      publicName: "Interferencia de otra mujer",
      prediagnosisHeadline:
        "La otra mujer está ocupando más espacio en tus decisiones que las señales reales de él.",
      headline:
        "La otra mujer puede existir. El mayor riesgo es dejar que ella controle cada una de tus decisiones.",
      diagnosis: [
        "Cuando comparas, investigas o provocas celos, dejas de mirar lo que realmente importa: lo que él ofrece directamente, con claridad y consistencia.",
        "Tu ruta separa lo confirmado, lo que estás infiriendo y lo que él hace contigo sin triangulación.",
      ],
      firstAction:
        "No investigar, no competir y no publicar una indirecta. Escribir los hechos comprobados y retirar cualquier acción motivada por comparación.",
      bridge:
        "Haz Que Vuelva™ entrega la decisión inmediata de tu ruta sin enseñarte a vigilar, atacar ni romper otra relación.",
      cta: "QUIERO DEJAR DE COMPETIR Y RECUPERAR MI POSICIÓN",
    },
    logistics: {
      publicName: "Contacto funcional",
      prediagnosisHeadline:
        "Él responde por obligación. Ahora necesitas distinguir contacto funcional de interés emocional.",
      headline:
        "Él responde porque hay algo que resolver. Eso todavía no dice si existe una puerta emocional.",
      diagnosis: [
        "Hijos, trabajo, dinero o patrimonio mantienen el canal abierto. Mezclar logística con reconquista puede hacer que cualquier respuesta parezca esperanza.",
        "La señal emocional necesita aparecer fuera de la obligación y sostenerse sin que tú la fuerces.",
      ],
      firstAction:
        "Separar el mensaje funcional del emocional. Resolver lo necesario sin añadir nostalgia, reclamos o una conversación sobre la relación.",
      bridge:
        "Haz Que Vuelva™ muestra cómo preservar el canal funcional y qué señal debe existir antes de probar una reapertura emocional.",
      cta: "QUIERO SEPARAR OBLIGACIÓN DE INTERÉS REAL",
    },
    red: {
      publicName: "Pausa estratégica",
      prediagnosisHeadline:
        "Tu caso exige una ruta sin contacto: primero recuperar control, después evaluar cualquier señal.",
      headline:
        "Tu siguiente paso no es insistir: es dejar de empeorar el canal y recuperar el control.",
      diagnosis: [
        "Si él pidió que no lo contactes o existe una restricción legal, cualquier posibilidad futura empieza por respetar ese límite. Buscar otro número, cuenta o intermediario solo aumenta la presión.",
        "En esta ruta, el protocolo no se usa para enviar mensajes. Se usa para frenar el impulso, ordenar los hechos y decidir con claridad durante los próximos siete días.",
      ],
      firstAction:
        "No contactar ni buscar otro canal. Registrar qué disparó el último impulso y empezar una pausa deliberada de siete días.",
      bridge:
        "Haz Que Vuelva™ puede guiar esta pausa: te muestra qué no hacer, cómo organizar tus señales y cuándo un límite significa que debes mantener la distancia.",
      cta: "QUIERO UNA RUTA PARA DEJAR DE IMPROVISAR",
    },
  },
  pitch: {
    headline:
      "Tu diagnóstico mostró el problema. Haz Que Vuelva™ te guía durante los próximos 7 días para que no vuelvas a improvisar.",
    paragraphs: [
      "Tu resultado ya te dio una primera decisión. La parte difícil empieza cuando aparece la ansiedad de cambiar el plan, mandar “solo una cosa más” o interpretar cualquier señal como una oportunidad.",
      "La Ventana de Memoria Afectiva™ no es un diagnóstico cerebral. Es un modelo para reconocer cuándo una interacción refuerza presión y cuándo puede crear una experiencia más ligera y coherente.",
    ],
    bullets: [
      "qué parar hoy",
      "cómo leer el estado real del canal",
      "cuándo escribir, responder o esperar",
      "qué mensaje usar cuando exista apertura",
      "cómo medir reciprocidad sin confundir nostalgia con reparación",
      "cómo avanzar sin rogar, perseguirlo ni perder tu dignidad",
    ],
    method: [
      "R · Regula el impulso que te hace actuar por ansiedad",
      "E · Examina tu ruta y el estado del canal",
      "G · Genera una pequeña prueba de cambio real",
      "R · Reabre solo cuando existe una puerta legítima",
      "E · Entra en sintonía con la reciprocidad que él demuestra",
      "S · Sintoniza cercanía sin acelerar",
      "A · Acuerda reparación o toma una decisión clara",
    ],
    items: [
      {
        title: "Diagnóstico y seis rutas",
        description: "con una primera acción compatible con tu escenario.",
      },
      {
        title: "Protocolo completo de 7 días",
        description: "una decisión por vez, sin improvisar.",
      },
      {
        title: "Árbol escribir / responder / esperar",
        description: "para elegir antes de tocar el chat.",
      },
      {
        title: "Mapa V.I.V.E. y Escala R0–R4",
        description: "para medir viabilidad y reciprocidad observable.",
      },
      {
        title: "Mensajes esenciales y hoja final",
        description: "solo cuando tu ruta permite contacto.",
      },
    ],
    proofTitle: "Esto es lo que existe dentro del protocolo",
    caption:
      "No estás comprando una promesa sobre lo que él hará. Estás comprando una decisión clara para lo que tú haces desde hoy.",
    price: "Acceso inmediato por US$7 · pago único",
    guarantee:
      "7 días de garantía. Si el protocolo no te ayuda a entender tu ruta y ejecutar tu primera decisión, puedes solicitar el reembolso dentro del plazo del checkout.",
    cta: "QUIERO ACCEDER A HAZ QUE VUELVA™ AHORA",
    microcopy:
      "Acceso después de la aprobación. Los complementos del checkout son opcionales; el método principal está completo.",
  },
  faq: {
    title: "Antes de decidir",
    items: [
      {
        question: "¿Esto garantiza que él va a volver?",
        answer:
          "No. Organiza lo que tú controlas: parar el error, leer el canal, elegir la siguiente acción y medir reciprocidad.",
      },
      {
        question: "¿Sirve si estoy bloqueada?",
        answer:
          "Sí para saber qué no hacer y reconocer una apertura legítima. No enseña a saltar bloqueos ni buscar canales alternativos.",
      },
      {
        question: "¿Y si hay otra mujer?",
        answer:
          "El protocolo entrega la decisión inicial. La profundización de tercera persona es un complemento opcional en el checkout.",
      },
      {
        question: "¿Voy a recibir mensajes listos?",
        answer:
          "Incluye mensajes esenciales cuando tu ruta permita contacto. No convierte una frase en garantía.",
      },
      {
        question: "¿Cuándo recibo acceso?",
        answer: "Después de la aprobación del pago, por el canal del checkout.",
      },
      {
        question: "¿Cuánto cuesta?",
        answer: "US$7, pago único, con garantía de siete días.",
      },
    ],
    cta: "EMPEZAR MI PROTOCOLO DE 7 DÍAS",
  },
  summaries: {
    state: {
      cold_contact: "hablan, pero él está frío o responde cada vez menos",
      blocked: "él bloqueó, dejó de responder o desapareció",
      third_person: "hay otra mujer o un miedo concreto de reemplazo",
      intermittent: "él se acerca y vuelve a desaparecer",
      green_contact: "él inicia y sostiene algunas conversaciones",
      logistics: "solo existe contacto por asuntos obligatorios",
      explicit_stop: "existe un límite explícito, miedo o restricción legal",
    },
    distance: {
      lt_7d: "menos de 7 días",
      "1_4w": "entre 1 y 4 semanas",
      "1_3m": "entre 1 y 3 meses",
      gt_3m: "más de 3 meses",
    },
    action: {
      long_message: "mensaje largo o pedido de otra oportunidad",
      insistence: "insistencia o cobro de respuesta",
      blind_silence: "contacto cero usado como regla universal",
      jealousy: "indirectas, celos o vigilancia",
      intimacy: "intimidad seguida de nueva distancia",
      pause: "ninguna acción todavía",
    },
    pain: {
      silence: "el silencio y el vacío",
      replacement: "el miedo de ser reemplazada",
      guilt: "la culpa por la última oportunidad",
      second_option: "el miedo de seguir como segunda opción",
    },
  },
  ui: {
    answerHint: "Elige la opción que más se parece a tu situación.",
    changeLanguage: "Cambiar idioma",
    loadingProofLabel: "Vista real del protocolo",
    restart: "Rehacer el diagnóstico",
    skip: "Continuar",
  },
};
