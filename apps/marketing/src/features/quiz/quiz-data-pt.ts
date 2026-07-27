import type {
  QuizCopy,
  QuizQuestion,
} from "@/features/quiz/quiz-contracts";
import { resultCopyPt } from "@/features/quiz/quiz-results-pt";

const questions: readonly QuizQuestion[] = [
  {
    id: "current_state",
    title:
      "Para preparar uma rota para o seu caso, como está a situação entre vocês hoje?",
    microcopy:
      "Suas respostas são usadas apenas para organizar este diagnóstico. Você não precisa enviar conversas nem informar seu nome.",
    options: [
      {
        label:
          "Ainda conversamos, mas ele está frio, distante ou responde cada vez menos",
        value: "cold_contact",
      },
      {
        label: "Ele me bloqueou, parou de responder ou desapareceu completamente",
        value: "blocked",
      },
      {
        label:
          "Existe outra mulher, ele voltou para a ex ou sinto que estou sendo substituída",
        value: "third_person",
      },
      {
        label: "Ele me procura, se aproxima e depois desaparece outra vez",
        value: "intermittent",
      },
      {
        label:
          "Ele voltou a iniciar conversas e mantém contato sem que eu precise empurrar",
        value: "green_contact",
      },
      {
        label:
          "Só conversamos por filhos, trabalho, dinheiro ou algo que precisamos resolver",
        value: "logistics",
      },
      {
        label:
          "Ele pediu claramente que eu não entre em contato, tenho medo ou existe restrição legal",
        value: "explicit_stop",
      },
    ],
  },
  {
    context:
      "Já identificamos o estado do canal. Agora vamos medir há quanto tempo a distância vem se acumulando.",
    id: "distance_time",
    title: "Há quanto tempo a relação está fria, rompida ou sem contato constante?",
    options: [
      {
        label: "Menos de 7 dias",
        transition:
          "Você ainda está na fase em que uma reação impulsiva pode mudar o tom de tudo.",
        value: "lt_7d",
      },
      {
        label: "Entre 1 e 4 semanas",
        transition:
          "A distância já criou uma nova rotina. O que você fizer agora precisa quebrar o padrão, não repeti-lo.",
        value: "1_4w",
      },
      {
        label: "Entre 1 e 3 meses",
        transition:
          "A esta altura, insistir na mesma estratégia só confirma a imagem que ele já está evitando.",
        value: "1_3m",
      },
      {
        label: "Mais de 3 meses",
        transition:
          "Depois de meses, a chave não é mandar mais. É criar uma experiência diferente e observar se existe abertura real.",
        value: "gt_3m",
      },
    ],
  },
  {
    id: "last_action",
    title: "Desde que ele se afastou, qual destas ações mais parece com o que você fez?",
    options: [
      {
        label: "Mandei uma mensagem longa, expliquei tudo ou pedi outra oportunidade",
        value: "long_message",
      },
      {
        label: "Insisti, cobrei resposta ou escrevi de novo depois que ele não respondeu",
        value: "insistence",
      },
      {
        label: "Desapareci completamente porque disseram que contato zero sempre funciona",
        value: "blind_silence",
      },
      {
        label: "Postei indiretas, tentei causar ciúme ou mostrar que já superei",
        value: "jealousy",
      },
      {
        label: "Voltamos a nos ver ou tivemos intimidade, mas depois ele esfriou novamente",
        value: "intimacy",
      },
      {
        label: "Ainda não fiz nada; cheguei aqui antes de cometer outro erro",
        value: "pause",
      },
    ].map((option) => ({
      ...option,
      transition:
        "Essa ação não define sua história, mas pode estar alimentando o Bucle de Rechazo™ que mantém o canal frio.",
    })),
  },
  {
    id: "dominant_pain",
    title: "O que mais está quebrando você por dentro agora?",
    variant: "cards",
    options: [
      {
        emoji: "◌",
        label: "Abrir o WhatsApp, ver o silêncio dele e sentir o vazio que ficou",
        transition:
          "O silêncio dói porque deixa espaço para sua cabeça inventar uma resposta diferente a cada hora.",
        value: "silence",
      },
      {
        emoji: "◇",
        label: "Imaginar ele feliz com outra enquanto eu ainda espero algum sinal",
        transition:
          "A comparação faz qualquer movimento dela parecer mais importante que o que ele realmente faz com você.",
        value: "replacement",
      },
      {
        emoji: "↯",
        label: "Pensar que eu mesma destruí a última chance por ansiedade",
        transition:
          "A culpa empurra você para explicar demais. Cada nova explicação pode soar como mais pressão.",
        value: "guilt",
      },
      {
        emoji: "↺",
        label: "Ele voltar quando está sozinho, mas nunca me escolher de verdade",
        transition:
          "Ele voltar por saudade ou solidão não significa que está disposto a reparar a relação.",
        value: "second_option",
      },
    ],
  },
  {
    id: "dominant_fear",
    title: "Se você continuar agindo do mesmo jeito, o que mais teme que aconteça?",
    options: [
      {
        emoji: "😔",
        label: "Ele me esquecer e nossa história deixar de significar alguma coisa",
        value: "forgotten",
      },
      {
        emoji: "💔",
        label: "Ele se apaixonar por outra e eu chegar tarde demais",
        value: "other_woman",
      },
      {
        emoji: "⏳",
        label: "A última janela de contato se fechar completamente",
        value: "closed_window",
      },
      {
        emoji: "🔁",
        label: "Ele voltar uma noite, desaparecer de novo e eu continuar presa no mesmo ciclo",
        value: "repeat_cycle",
      },
    ].map((option) => ({
      ...option,
      transition:
        "Já temos o necessário. Vamos cruzar o canal, o tempo e sua última ação.",
    })),
  },
];

export const quizCopyPt: QuizCopy = {
  intro: {
    eyebrow: "DIAGNÓSTICO PRIVADO DE RECONEXÃO · 2 MINUTOS",
    headline:
      "Descubra o que está fazendo ele se afastar… e como abrir uma nova Ventana de Memoria Afectiva™.",
    subheadline:
      "Responda cinco perguntas. Veja o que está fechando a porta, qual erro precisa parar hoje e a primeira decisão do protocolo de sete dias.",
    cta: "Descobrir o que está acontecendo",
    privacy:
      "Suas respostas são usadas só neste diagnóstico. Não pedimos nome, prints nem conversas.",
  },
  questions,
  loaderOne: {
    title: "Analisando seu caso e o estado real do contato…",
    states: [
      "Lendo o estado do canal…",
      "Identificando o Bucle de Rechazo™ ativo…",
      "Calculando seu Índice de Distância Emocional…",
      "Preparando a primeira decisão para o seu caso…",
    ],
    captions: [
      "Seu caso não recebe uma regra universal. Recebe uma rota.",
      "Antes da mensagem vem a decisão.",
      "Sete dias, uma ação de cada vez.",
    ],
  },
  prediagnosis: {
    alert: "ANÁLISE INICIAL CONCLUÍDA!",
    scoreTitle: "Índice de Distância Emocional",
    scoreSubtitle:
      "Conforme estado do canal, tempo e pressão da última ação.",
    loop: [
      "silêncio ou sinal ambíguo",
      "ansiedade",
      "mensagem, pressão, ciúme ou sumiço teatral",
      "mais distância",
      "mais urgência para corrigir",
      "repetição",
    ],
    bodyAfterLoop: [
      "A saída começa quando você muda a experiência recente que ele associa a você dentro da Ventana de Memoria Afectiva™.",
      "Esse modelo não lê a mente dele: ajuda você a evitar que a próxima interação repita a pressão que ele já está evitando.",
    ],
    needs: [
      "o que parar hoje",
      "se o canal permite escrever, responder ou esperar",
      "qual sinal observar antes do próximo passo",
      "quando avançar e quando não fazer nada",
    ],
    cta: "QUERO VER COMO REABRIR MINHA JANELA",
    microcopy:
      "Seu resultado completo já está sendo preparado. Primeiro, preciso saber que mudança você quer provocar.",
  },
  desire: {
    title:
      "Além de saber o que parar hoje, você quer usar os próximos sete dias para deixar de reforçar pressão e voltar a criar curiosidade e abertura?",
    options: [
      {
        label: "Sim. Quero que ele volte a sentir minha ausência e vontade de se aproximar",
        value: "desire_missing",
      },
      {
        label: "Sim. Quero uma rota direta para não perder ele de novo por ansiedade",
        value: "desire_control",
      },
    ],
  },
  commitment: {
    title:
      "Seu protocolo pode orientar você a escrever, responder ou esperar. Você se compromete a seguir a rota por sete dias, mesmo quando sua ansiedade quiser outra coisa?",
    options: [
      {
        label: "Sim. Quero parar de improvisar e seguir uma decisão por dia",
        value: "commit_route",
      },
      {
        label: "Sim. Mas preciso que seja simples, direto e aplicável desde hoje",
        value: "commit_simple",
      },
    ],
  },
  loaderTwo: {
    title: "Criando sua rota inicial de sete dias…",
    states: [
      "Separando sinais reais de interpretações…",
      "Definindo o que você precisa parar hoje…",
      "Cruzando sua rota com o Método R.E.G.R.E.S.A. 7D™…",
      "Preparando sua primeira decisão de 24 horas…",
    ],
    captions: [
      "Dia 1 · Regula: pare de agir para aliviar ansiedade.",
      "Dia 2 · Examina: identifique a rota e o estado do canal.",
      "Dia 3 · Gera: crie uma mudança pequena e observável.",
      "Dias 4–7: reabra quando existe canal, meça reciprocidade e decida.",
    ],
  },
  painImpulses: {
    silence: {
      sentence: "o silêncio e o vazio que ficou",
      impulse: "buscar uma resposta que alivie a incerteza agora",
    },
    replacement: {
      sentence: "o medo de estar sendo substituída",
      impulse: "se comparar, vigiar ou tentar provocar uma reação",
    },
    guilt: {
      sentence: "a culpa pelo que você fez",
      impulse: "explicar demais para corrigir tudo numa mensagem",
    },
    second_option: {
      sentence: "o medo de continuar como segunda opção",
      impulse: "aceitar uma aparição sem exigir consistência",
    },
  },
  ...resultCopyPt,
};
