import type { QuizFlowCopy, QuizFlowScreen } from "./quiz-flow-contracts.ts";

export const quizFlowPostScreensEs = [
  {
    id: "analysis_loader",
    type: "loader",
    asset: "/images/quiz/v2/reconnection-goal.webp",
    title: "Cargando tus respuestas...",
    body: [
      "Analizando el tiempo de separación...",
      "Cruzando quién terminó y por qué...",
      "Midiendo el estado actual del contacto...",
      "Calculando tu probabilidad de reconquista...",
    ],
  },
  {
    id: "expert_intro",
    type: "authority",
    asset: "/images/quiz/v2/lucia-herrera.webp",
    title: "Gracias por responder con sinceridad.",
    subtitle: "Ahora sí puedo mostrarte qué está pasando y por qué tu próximo movimiento necesita ser diferente.",
    body: [
      "Mi nombre es Lucía Herrera y formo parte del equipo editorial de HAZ QUE VUELVA.",
      "Nuestro trabajo es transformar los patrones que más se repiten después de una ruptura (ansiedad, silencio, bloqueos, otra mujer y contacto confuso) en decisiones simples que una mujer pueda seguir sin improvisar frente al chat.",
      "Cruzamos tus respuestas para entender cuánto acceso todavía existe, qué está aumentando la distancia y cuál es el error que más podría jugar en tu contra ahora.",
      "Preparamos una ruta de 7 días para ayudarte a recuperar control, romper la reacción que él ya espera y volver a crear espacio para curiosidad, deseo y acercamiento. Sin rogar. Sin perseguirlo por otras cuentas. Sin convertir tu vida en un juego de indirectas.",
    ],
    button: "CONTINUAR",
  },
  {
    id: "social_proof",
    type: "proof",
    title: "3 historias. 3 situaciones distintas. El mismo punto de quiebre.",
    subtitle: "Dejaron de reaccionar como él esperaba y siguieron una ruta durante siete días.",
    button: "¡YO TAMBIÉN QUIERO CAMBIAR ESTA HISTORIA!",
  },
  {
    id: "commitment",
    type: "commitment",
    title: "¿Qué tanto quieres que él vuelva?",
    subtitle: "Todavía no estoy segura → Estoy dispuesta a seguir una ruta y hacerlo bien",
    body: [
      "Un impulso de diez segundos puede cerrar una puerta que todavía existe. El siguiente paso fue creado para mujeres dispuestas a seguir una ruta durante siete días antes de volver a actuar por ansiedad.",
    ],
    options: [
      { label: "1", value: "commit_1" },
      { label: "2", value: "commit_2" },
      { label: "3", value: "commit_3" },
      { label: "4", value: "commit_4" },
    ],
  },
  {
    id: "plan_loader",
    type: "loader",
    title: "Cargando tus respuestas",
    body: [
      "Configurando tu diagnóstico personalizado...",
      "Analizando las respuestas que más cambian tu escenario...",
      "Preparando tu plan HAZ QUE VUELVA...",
      "Organizando tu probabilidad y los próximos 7 días...",
    ],
  },
  {
    id: "final_result",
    type: "result",
    title: "Tu plan está listo.",
  },
] satisfies readonly QuizFlowScreen[];

export const quizFlowProofsEs: QuizFlowCopy["proofs"] = [
  {
    id: "camila",
    name: "Camila",
    context: "Había sido bloqueada después de enviar varios mensajes seguidos.",
    messages: [
      "Seguí la ruta y dejé de buscarlo por otras cuentas, aunque sentía que iba a explotar.",
      "Al sexto día me desbloqueó y me preguntó por qué había desaparecido.",
      "Ahora volvemos a hablar sin que yo tenga que perseguirlo.",
    ],
    conclusion: "La puerta se reabrió cuando dejó de convertir su miedo en presión.",
    src: "/images/quiz/proof-preview/camila-chat-v3.webp",
  },
  {
    id: "valentina",
    name: "Valentina",
    context: "Creía que dejar de competir con otra mujer era perderlo definitivamente.",
    messages: [
      "El protocolo me hizo separar lo que sabía de todo lo que estaba imaginando.",
      "Dejé las indirectas y seguí mi ruta durante los 7 días.",
      "Ayer él volvió a buscarme y me pidió que habláramos en persona.",
    ],
    conclusion: "Recuperó la posición que el miedo estaba destruyendo.",
    src: "/images/quiz/proof-preview/valentina-chat-v3.webp",
  },
  {
    id: "sofia",
    name: "Sofía",
    context: "Convertía cada respuesta de él en una conversación larga y llena de presión.",
    messages: [
      "Esta vez igualé su intensidad y cerré la conversación como decía mi ruta.",
      "Al día siguiente fue él quien volvió a escribirme.",
      "Hoy me dijo que siente que estoy diferente y que quiere vernos.",
    ],
    conclusion: "Dejó de transformar cada apertura en una nueva carga emocional.",
    src: "/images/quiz/proof-preview/sofia-chat-v3.webp",
  },
];

export const quizFlowResultEs: QuizFlowCopy["result"] = {
  badge: "TU PLAN PERSONALIZADO ESTÁ LISTO",
  title: "Tu plan de 7 días para reconquistar a tu ex y hacer que vuelva a mirarte como antes está listo.",
  scoreLabel: "Probabilidad de reconquistar a tu ex",
  scoreLevel: "Nivel: Alto",
  timeline: [
    { label: "AHORA", text: "Él cree que puede alejarse y encontrarte esperando." },
    { label: "2 DÍAS", text: "Empieza a notar que tu reacción ya no es la misma." },
    { label: "5 DÍAS", text: "Tu ausencia gana peso y él se pregunta qué cambió." },
    { label: "7 DÍAS", text: "La dinámica puede invertirse y él vuelve a aproximarse." },
  ],
  outcomes: [
    "Empieza a pensar en ti sin que tengas que perseguirlo.",
    "Tu ausencia vuelve a generar curiosidad.",
    "Él nota una versión tuya que no reacciona como esperaba.",
    "Sabes cuándo escribir, responder o esperar.",
    "Dejas de competir y recuperas control sobre tus decisiones.",
    "Creas una posibilidad real de reconexión sin rogar ni cruzar límites.",
  ],
  button: "SÍ, QUIERO QUE VUELVA",
};
