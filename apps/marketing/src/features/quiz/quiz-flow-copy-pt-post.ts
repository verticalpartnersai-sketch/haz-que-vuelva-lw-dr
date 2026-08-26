import type { QuizFlowCopy, QuizFlowScreen } from "./quiz-flow-contracts.ts";

export const quizFlowPostScreensPt = [
  {
    id: "analysis_loader",
    type: "loader",
    asset: "/images/quiz/v2/obsession-couple.webp",
    title: "Carregando suas respostas...",
    body: ["Analisando padrões"],
  },
  {
    id: "expert_intro",
    type: "authority",
    asset: "/images/quiz/v2/authority-couple-istanbul.webp",
    title: "Obrigada pelas suas respostas!",
    subtitle: "Estou aqui para ajudar você!",
    body: [
      "Meu nome é Lucía Herrera e sou especialista em relacionamentos.",
      "Levei 5 anos de pesquisa e testes junto com a minha equipe para entender como a química do cérebro funciona quando o assunto é retomar um relacionamento.",
      "E descobrimos os gatilhos neurológicos que podem fazer um homem sentir um desejo ardente e querer voltar correndo para uma mulher.",
      "E reuni tudo isso em um plano comprovado de 21 dias, com truques e estratégias simples para ajudar você a reconquistar o seu ex.",
      "E tudo isso sem se humilhar, fazer joguinhos mentais, usar técnicas de sedução ou qualquer outra porcaria que ensinam na internet.",
    ],
    button: "CONTINUAR",
  },
  {
    id: "social_proof",
    type: "proof",
    title: "93%",
    subtitle: "93% das minhas alunas viram resultados significativos nos primeiros dias usando o meu plano:",
    button: "EU QUERO!",
  },
  {
    id: "commitment",
    type: "commitment",
    title: "O quanto você quer ele de volta?",
    subtitle: "Não tenho certeza → Eu realmente quero",
    body: [
      "Eu levo muito a sério o processo de ajudar você a reconquistar ele e estou procurando mulheres que estejam verdadeiramente comprometidas com isso.",
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
    title: "Carregando suas respostas",
    body: [
      "Configurando seu plano personalizado",
      "Analisando seu perfil e suas respostas...",
    ],
  },
  {
    id: "final_result",
    type: "result",
    title: "Seu plano está pronto!",
  },
] satisfies readonly QuizFlowScreen[];

export const quizFlowProofsPt: QuizFlowCopy["proofs"] = [
  {
    id: "camila",
    name: "Camila",
    context: "Havia sido bloqueada depois de enviar várias mensagens seguidas.",
    messages: [
      "Segui a rota e parei de procurar ele por outras contas, mesmo sentindo que ia explodir.",
      "No sexto dia ele me desbloqueou e perguntou por que eu tinha desaparecido.",
      "Agora voltamos a conversar sem que eu precise correr atrás.",
    ],
    conclusion: "A porta reabriu quando ela deixou de transformar o medo em pressão.",
    src: "/images/quiz/proof-preview/camila-chat-v3.webp",
  },
  {
    id: "valentina",
    name: "Valentina",
    context: "Acreditava que parar de competir com outra mulher era perder ele de vez.",
    messages: [
      "O protocolo me fez separar o que eu sabia de tudo o que estava imaginando.",
      "Parei com as indiretas e segui minha rota durante os 7 dias.",
      "Ontem ele voltou a me procurar e pediu para conversarmos pessoalmente.",
    ],
    conclusion: "Recuperou a posição que o medo estava destruindo.",
    src: "/images/quiz/proof-preview/valentina-chat-v3.webp",
  },
  {
    id: "sofia",
    name: "Sofía",
    context: "Transformava cada resposta dele numa conversa longa e cheia de pressão.",
    messages: [
      "Desta vez igualei a intensidade e encerrei a conversa como minha rota indicava.",
      "No dia seguinte foi ele quem voltou a me escrever.",
      "Hoje ele disse que sente que eu estou diferente e quer me ver.",
    ],
    conclusion: "Ela deixou de transformar cada abertura numa nova carga emocional.",
    src: "/images/quiz/proof-preview/sofia-chat-v3.webp",
  },
];

export const quizFlowResultPt: QuizFlowCopy["result"] = {
  badge: "SEU PLANO PERSONALIZADO ESTÁ PRONTO",
  title: "Seu plano de 21 dias para reconquistar o seu ex e fazer ele se apaixonar por você de novo está pronto!",
  scoreLabel: "Probabilidade de reconquistar o seu ex",
  scoreLevel: "🔥 Nível: Alto",
  timeline: [
    { label: "AGORA", text: "Seu ex não vê um futuro com você." },
    { label: "DEPOIS DE 2 DIAS", text: "Seu ex começa a pensar em você." },
    { label: "DEPOIS DE 2 SEMANAS", text: "Ele não consegue se imaginar sem você." },
    { label: "21 DIAS", text: "Ele faz de tudo para reconquistar você." },
  ],
  outcomesHeading: "O que vai acontecer:",
  outcomes: [
    "Seu ex vai começar a pensar em você o tempo todo e sentir sua falta.",
    "Ele vai procurar você, mandar mensagens e finalmente se abrir novamente.",
    "Ele vai se sentir atraído por você, incapaz de se controlar.",
    "Ele verá você como a única mulher capaz de satisfazer ele emocional e fisicamente.",
    "Ele voltará para a sua cama, desesperado para estar com você.",
    "Você construirá uma confiança inabalável e uma autoestima indestrutível.",
    "Você reconstruirá uma conexão intensa e apaixonada que será impossível de quebrar.",
    "Ele vai querer estar ao seu lado novamente como nunca antes...",
  ],
  question: "Você está pronta para reconquistar ele?",
  button: "SIM, EU QUERO ELE DE VOLTA!",
};
