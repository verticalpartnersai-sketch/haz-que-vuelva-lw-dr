import type { QuizFlowCopy, QuizFlowScreen } from "./quiz-flow-contracts.ts";

export const quizFlowPostScreensEs = [
  {
    id: "analysis_loader",
    type: "loader",
    asset: "/images/quiz/v2/obsession-couple.webp",
    title: "Cargando tus respuestas...",
    body: ["Analizando patrones"],
  },
  {
    id: "expert_intro",
    type: "authority",
    asset: "/images/quiz/v2/authority-couple-istanbul.webp",
    title: "¡Gracias por tus respuestas!",
    subtitle: "¡Estoy aquí para ayudarte!",
    body: [
      "Mi nombre es Lucía Herrera y soy especialista en relaciones.",
      "Me tomó 5 años de investigación y pruebas junto con mi equipo comprender cómo funciona la química del cerebro cuando se trata de retomar una relación.",
      "Y descubrimos los gatillos neurológicos que pueden hacer que un hombre sienta un deseo ardiente y quiera volver corriendo con una mujer.",
      "Y reuní todo esto en un plan comprobado de 21 días, con trucos y estrategias simples para ayudarte a reconquistar a tu ex.",
      "Y todo esto sin humillarte, hacer juegos mentales, usar técnicas de seducción ni ninguna otra basura que enseñan en internet.",
    ],
    button: "CONTINUAR",
  },
  {
    id: "social_proof",
    type: "proof",
    title: "93%",
    subtitle: "El 93% de mis alumnas vio resultados significativos en los primeros días usando mi plan:",
    button: "¡YO QUIERO!",
  },
  {
    id: "commitment",
    type: "commitment",
    title: "¿Qué tanto quieres que él vuelva?",
    subtitle: "No estoy segura → Realmente lo quiero",
    body: [
      "Me tomo muy en serio el proceso de ayudarte a reconquistarlo, y estoy buscando mujeres que estén verdaderamente comprometidas con esto.",
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
      "Configurando tu plan personalizado",
      "Analizando tu perfil y tus respuestas...",
    ],
  },
  {
    id: "final_result",
    type: "result",
    title: "¡Tu plan está listo!",
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
  title: "¡Tu plan de 21 días para reconquistar a tu ex y hacer que se enamore de ti otra vez está listo!",
  scoreLabel: "Probabilidad de reconquistar a tu ex",
  scoreLevel: "🔥 Nivel: Alto",
  timeline: [
    { label: "AHORA", text: "Tu ex no ve un futuro juntos." },
    { label: "DESPUÉS DE 2 DÍAS", text: "Tu ex empieza a pensar en ti." },
    { label: "DESPUÉS DE 2 SEMANAS", text: "No puede imaginarse sin ti." },
    { label: "21 DÍAS", text: "Hace de todo para reconquistarte." },
  ],
  outcomesHeading: "Lo que sucederá:",
  outcomes: [
    "Tu ex empezará a pensar en ti todo el tiempo y a extrañarte.",
    "Él te buscará, te enviará mensajes y finalmente volverá a abrirse contigo.",
    "Se sentirá atraído por ti, incapaz de controlarse.",
    "Te verá como la única mujer capaz de satisfacerlo emocional y físicamente.",
    "Volverá a tu cama, desesperado por estar contigo.",
    "Construirás una confianza inquebrantable y una autoestima indestructible.",
    "Reconstruirás una conexión intensa y apasionada que será imposible de romper.",
    "Querrá volver a estar a tu lado como nunca antes...",
  ],
  question: "¿Estás lista para reconquistarlo?",
  button: "SÍ, ¡QUIERO QUE VUELVA!",
};
