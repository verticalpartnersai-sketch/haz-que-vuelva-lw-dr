import type { QuizFlowCopy, QuizFlowScreen } from "./quiz-flow-contracts.ts";

export const quizFlowPostScreensPt = [
  {
    id: "analysis_loader",
    type: "loader",
    asset: "/images/quiz/v2/reconnection-goal.webp",
    title: "Carregando suas respostas...",
    body: [
      "Analisando o tempo de separação...",
      "Cruzando quem terminou e por quê...",
      "Medindo o estado atual do contato...",
      "Calculando sua probabilidade de reconquista...",
    ],
  },
  {
    id: "expert_intro",
    type: "authority",
    asset: "/images/quiz/v2/lucia-herrera.webp",
    title: "Obrigada por responder com sinceridade.",
    subtitle: "Agora consigo mostrar o que está acontecendo e por que seu próximo movimento precisa ser diferente.",
    body: [
      "Meu nome é Lucía Herrera e faço parte da equipe editorial do HAZ QUE VUELVA.",
      "Nosso trabalho é transformar os padrões que mais se repetem depois de um término (ansiedade, silêncio, bloqueio, outra mulher e contato confuso) em decisões simples que uma mulher consegue seguir sem improvisar diante do chat.",
      "Cruzamos suas respostas para entender quanto acesso ainda existe, o que está aumentando a distância e qual erro pode jogar mais contra você agora.",
      "Preparamos uma rota de 7 dias para ajudar você a recuperar o controle, quebrar a reação que ele já espera e abrir espaço para curiosidade, desejo e aproximação. Sem implorar. Sem correr atrás por outras contas. Sem transformar sua vida num jogo de indiretas.",
    ],
    button: "CONTINUAR",
  },
  {
    id: "social_proof",
    type: "proof",
    title: "3 histórias. 3 situações diferentes. O mesmo ponto de virada.",
    subtitle: "Elas pararam de reagir como ele esperava e seguiram uma rota durante sete dias.",
    button: "EU TAMBÉM QUERO MUDAR ESSA HISTÓRIA!",
  },
  {
    id: "commitment",
    type: "commitment",
    title: "O quanto você quer ele de volta?",
    subtitle: "Ainda não tenho certeza → Estou disposta a seguir uma rota e fazer direito",
    body: [
      "Um impulso de dez segundos pode fechar uma porta que ainda existe. O próximo passo foi criado para mulheres dispostas a seguir uma rota por sete dias antes de voltar a agir pela ansiedade.",
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
      "Configurando seu diagnóstico personalizado...",
      "Analisando as respostas que mais mudam seu cenário...",
      "Preparando seu plano HAZ QUE VUELVA...",
      "Organizando sua probabilidade e os próximos 7 dias...",
    ],
  },
  {
    id: "final_result",
    type: "result",
    title: "Seu plano está pronto.",
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
  title: "Seu plano de 7 dias para reconquistar o seu ex e fazer ele voltar a olhar para você como antes está pronto.",
  scoreLabel: "Probabilidade de reconquistar o seu ex",
  scoreLevel: "Nível: Alto",
  timeline: [
    { label: "AGORA", text: "Ele acredita que pode se afastar e encontrar você esperando." },
    { label: "2 DIAS", text: "Começa a perceber que sua reação já não é a mesma." },
    { label: "5 DIAS", text: "Sua ausência ganha peso e ele se pergunta o que mudou." },
    { label: "7 DIAS", text: "A dinâmica pode se inverter e ele volta a se aproximar." },
  ],
  outcomes: [
    "Ele começa a pensar em você sem que você precise correr atrás.",
    "Sua ausência volta a provocar curiosidade.",
    "Ele percebe uma versão sua que não reage como esperava.",
    "Você sabe quando escrever, responder ou esperar.",
    "Para de competir e recupera controle sobre suas decisões.",
    "Cria uma possibilidade real de reconexão sem implorar nem cruzar limites.",
  ],
  button: "SIM, EU QUERO QUE ELE VOLTE",
};
