import type { QuizCopy } from "@/features/quiz/quiz-contracts";

type ResultCopy = Pick<
  QuizCopy,
  "demonstration" | "faq" | "pitch" | "result" | "routes" | "summaries" | "ui"
>;

export const resultCopyEs: ResultCopy = {
  demonstration: {
    headline:
      "Tu problema no es que él no sienta nada. Es que cada movimiento ansioso puede hacer que alejarse de ti se sienta como alivio.",
    subheadline:
      "Y mientras ese alivio se repite, él aprende a resistir tu presencia en lugar de extrañarla. Eso es lo que debes interrumpir antes de volver al chat.",
    cases: [
      {
        eyebrow: "CUANDO BUSCAS ALIVIO",
        description:
          "Un mensaje largo, una explicación más o pedir otra oportunidad puede calmarte por minutos. Para él, puede confirmar que volver significa regresar a la misma presión.",
        decision:
          "Resultado: él siente alivio cuando se aleja y aprende a protegerse de tu próximo contacto.",
        proof: "routes",
      },
      {
        eyebrow: "CUANDO INTENTAS PROVOCARLO",
        description:
          "Desaparecer sin estrategia, publicar indirectas o provocar celos no crea deseo por sí solo. Si él reconoce la maniobra, solo ve ansiedad disfrazada de control.",
        decision:
          "Resultado: su atención permanece en defenderse, no en preguntarse por qué te siente diferente.",
        proof: "scale",
      },
      {
        eyebrow: "CUANDO CAMBIAS EL PATRÓN",
        description:
          "Cuando dejas de reaccionar como él espera y haces el movimiento proporcional al canal, la presión baja. Tu presencia deja de parecer una repetición del pasado.",
        decision:
          "Resultado: la resistencia pierde fuerza y puede volver a aparecer curiosidad, contraste y voluntad de acercarse.",
        proof: "decision",
      },
    ],
    dynamicLabels: [
      "Lo que todavía existe entre ustedes",
      "El movimiento que puede destruirlo",
      "Lo primero que debes hacer para cambiar el patrón",
    ],
    cta: "QUIERO QUE MI PRÓXIMO MOVIMIENTO JUEGUE A MI FAVOR",
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
        "No necesitas enviar otra explicación. Necesitas retirar presión antes de que el silencio se convierta en rechazo definitivo.",
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
      costOfInaction:
        "Si vuelves al chat sin criterio, cada atajo, explicación o intento por otro canal puede convertir una distancia temporal en rechazo consolidado.",
      offerHeadline:
        "Tu primera victoria no es una respuesta. Es dejar de darle nuevas razones para mantener la puerta cerrada.",
      offerLead:
        "En la ruta Puerta Cerrada, Haz Que Vuelva™ organiza una pausa con criterio y muestra qué señales deben existir antes de cualquier reapertura.",
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
      costOfInaction:
        "Si tratas cada respuesta corta como una oportunidad, pondrás sobre un canal frágil una presión que él todavía no puede sostener.",
      offerHeadline:
        "Todavía tienes acceso a él. Ahora debes impedir que la ansiedad convierta esa apertura en la confirmación de que estar lejos de ti es mejor.",
      offerLead:
        "Haz Que Vuelva organiza la intensidad, el tiempo y cada siguiente decisión para que él deje de encontrar la misma presión y empiece a notar una versión tuya que no esperaba.",
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
      costOfInaction:
        "Si pides definición antes de que exista consistencia, puedes convertir curiosidad en presión y una apertura real en nueva distancia.",
      offerHeadline:
        "No necesitas hacerlo volver. Necesitas impedir que la prisa destruya la apertura que él ya empezó a mostrar.",
      offerLead:
        "En la ruta Apertura Real, Haz Que Vuelva™ muestra cómo responder con proporción, medir inversión y avanzar sin acelerar la relación.",
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
      costOfInaction:
        "Mientras vigilas, comparas o intentas vencer a la otra mujer, ella ocupa tu atención y dirige una estrategia que debería pertenecerte.",
      offerHeadline:
        "Deja de competir por una posición que solo su comportamiento puede confirmar.",
      offerLead:
        "En la ruta Interferencia de Otra Mujer, el protocolo separa hechos de miedo y devuelve tu atención a la única evidencia que importa: reciprocidad directa.",
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
      costOfInaction:
        "Si usas hijos, trabajo o dinero para crear cercanía, cada respuesta obligatoria alimentará esperanza sin demostrar interés.",
      offerHeadline:
        "El contacto obligatorio no es apertura emocional. Mezclarlos te mantiene atrapada en señales que nunca fueron promesas.",
      offerLead:
        "En la ruta Contacto Funcional, Haz Que Vuelva™ separa logística de reconexión y define la señal mínima antes de avanzar emocionalmente.",
      cta: "QUIERO SEPARAR OBLIGACIÓN DE INTERÉS REAL",
    },
    red: {
      publicName: "Pausa estratégica",
      prediagnosisHeadline:
        "Tu situación exige una ruta sin contacto: primero recuperar control, después evaluar cualquier señal.",
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
      costOfInaction:
        "Buscar otro número, cuenta o intermediario no reabre el canal: aumenta la presión, destruye confianza y puede agravar una restricción que debe respetarse.",
      offerHeadline:
        "En esta ruta, ganar no significa enviar el mensaje correcto. Significa recuperar el control antes de que el impulso decida por ti.",
      offerLead:
        "En la ruta Pausa Estratégica, Haz Que Vuelva™ funciona como un protocolo de contención, lectura de hechos y decisión sin contacto.",
      cta: "QUIERO UNA RUTA PARA DEJAR DE IMPROVISAR",
    },
  },
  pitch: {
    headline:
      "Tu diagnóstico mostró el problema. Haz Que Vuelva™ te guía durante los próximos 7 días para que no vuelvas a improvisar.",
    paragraphs: [
      "Tu resultado ya te dio una primera decisión. La parte peligrosa empieza cuando tu cerebro busca alivio rápido e intenta negociar el plan con “solo un mensaje más”.",
      "Haz Que Vuelva™ interrumpe ese ciclo antes del chat: identificas el estado del canal, ejecutas una decisión proporcional y solo avanzas cuando existe reciprocidad observable.",
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
    proofTitle: "Todo lo que vas a encontrar dentro de tu protocolo",
    caption:
      "No estás comprando una promesa sobre lo que él hará. Estás comprando una decisión clara para lo que tú haces desde hoy.",
    price: "Acceso inmediato por US$7",
    guarantee:
      "7 días de garantía. Si el protocolo no te ayuda a entender tu ruta y ejecutar tu primera decisión, puedes solicitar el reembolso dentro del plazo del checkout.",
    cta: "QUIERO ACCEDER A HAZ QUE VUELVA™ AHORA",
    microcopy: "",
  },
  faq: {
    title: "Antes de decidir",
    items: [
      {
        question: "¿Y si siento que necesito escribirle hoy mismo?",
        answer:
          "Ese impulso es exactamente el momento en que más necesitas una ruta. Antes de tocar el chat, el protocolo te ayuda a separar urgencia emocional de una apertura real y a elegir el movimiento que no añade más presión.",
      },
      {
        question: "¿Esto sirve si él me bloqueó?",
        answer:
          "Sí. En esa ruta, el primer objetivo no es buscar otra cuenta o número. Es dejar de convertir el bloqueo en más persecución, recuperar control y aprender qué señales tendrían que existir antes de cualquier reapertura legítima.",
      },
      {
        question: "¿Y si hay otra mujer?",
        answer:
          "Tu ruta separa hechos, sospechas y reciprocidad directa. Así dejas de competir con una historia que quizá estás completando desde el miedo y vuelves a mirar lo único que puede orientar una decisión: lo que él hace contigo.",
      },
      {
        question: "¿Funciona si todavía hablamos, pero él está frío?",
        answer:
          "Ese es uno de los escenarios centrales del protocolo. Aprendes a igualar la intensidad real del canal, cerrar conversaciones sin arrastrarlas y observar si él vuelve a invertir sin que tú tengas que empujarlo.",
      },
      {
        question: "¿Qué pasa si solo hablamos por hijos, trabajo o dinero?",
        answer:
          "El protocolo te ayuda a separar contacto obligatorio de interés emocional. Resuelves lo necesario sin usar la logística como excusa para buscar cercanía y aprendes qué señal tendría que aparecer fuera de la obligación.",
      },
      {
        question: "¿Voy a recibir mensajes listos para enviar?",
        answer:
          "Recibes mensajes esenciales, pero solo para los momentos en que tu ruta permite contacto. La fuerza no está en una frase mágica: está en usar la frase correcta, con la intensidad correcta y en el momento correcto.",
      },
      {
        question: "¿Tengo que desaparecer durante 30 días?",
        answer:
          "No. Haz Que Vuelva no aplica contacto cero como una regla universal. Algunas rutas exigen pausa; otras exigen responder con proporción. El diagnóstico existe justamente para que no uses el mismo consejo en situaciones diferentes.",
      },
      {
        question: "¿Y si ya cometí muchos errores y pedí otra oportunidad?",
        answer:
          "No puedes borrar lo que ocurrió, pero sí puedes dejar de confirmarlo. Los próximos siete días sirven para interrumpir el patrón que él ya espera y construir una experiencia diferente antes de intentar acercarte otra vez.",
      },
      {
        question: "¿El protocolo garantiza que él volverá?",
        answer:
          "Nadie puede garantizar la decisión de otra persona. El protocolo organiza lo que sí controlas: parar el error, leer el canal, elegir la siguiente acción y medir reciprocidad sin perderte en promesas.",
      },
      {
        question: "¿Cuánto tiempo necesito por día?",
        answer:
          "La ruta fue diseñada para decisiones breves y ejecutables. No necesitas pasar horas estudiando; necesitas abrir el material del día, entender la decisión y aplicarla sin negociar con la ansiedad.",
      },
      {
        question: "¿Puedo seguir el protocolo desde el celular?",
        answer:
          "Sí. El material es digital y puede consultarse desde el celular, tablet o computadora para que tengas tu ruta cerca justamente cuando aparezca el impulso de improvisar.",
      },
      {
        question: "¿Qué recibo exactamente al entrar?",
        answer:
          "Recibes el diagnóstico con seis rutas, el protocolo completo de siete días, el árbol escribir o responder o esperar, el mapa V.I.V.E., la escala R0–R4, mensajes esenciales y la hoja final de decisión.",
      },
      {
        question: "¿Cuándo recibo el acceso?",
        answer:
          "El acceso se libera después de la aprobación del pago por el canal informado en el checkout. No hay envío físico ni espera por entrega.",
      },
      {
        question: "¿El pago es mensual?",
        answer:
          "No. El acceso cuesta US$7 y no crea una mensualidad recurrente.",
      },
      {
        question: "¿Cómo funciona la garantía de 7 días?",
        answer:
          "Entra, descubre tu ruta y aplica las primeras decisiones. Si dentro de siete días sientes que el protocolo no te entregó la claridad esperada, puedes solicitar el reembolso dentro del plazo de garantía.",
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
