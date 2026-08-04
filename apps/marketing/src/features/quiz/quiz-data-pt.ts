import type {
  QuizCopy,
  QuizQuestion,
} from "@/features/quiz/quiz-contracts";
import { brandCopyPt } from "@/features/quiz/quiz-brand-copy-pt";
import { previewCopyPt } from "@/features/quiz/quiz-preview-copy-pt";
import { resultCopyPt } from "@/features/quiz/quiz-results-pt";

const questions: readonly QuizQuestion[] = [
  {
    id: "current_state",
    title:
      "Antes de você voltar a escrever para ele, preciso saber o que está acontecendo entre vocês hoje.",
    microcopy:
      "Responda pelo que ele faz, não pelo que você gostaria que ele ainda sentisse.",
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
      "Já sei quanto acesso você ainda tem a ele. Agora preciso medir há quanto tempo ele está aprendendo a viver com a sua ausência.",
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
        "O alívio de agir pode durar segundos. A distância que essa ação reforça pode durar dias. Esse é o Bucle de Rechazo™.",
    })),
  },
  {
    id: "dominant_pain",
    title: "O que mais está quebrando você por dentro agora?",
    variant: "cards",
    options: [
      {
        image: "/images/quiz/pain/pain-silence-v1.webp",
        label: "Abrir o WhatsApp, ver o silêncio dele e sentir o vazio que ficou",
        transition:
          "O silêncio dói porque deixa espaço para sua cabeça inventar uma resposta diferente a cada hora.",
        value: "silence",
      },
      {
        image: "/images/quiz/pain/pain-replacement-v1.webp",
        label: "Imaginar ele feliz com outra enquanto eu ainda espero algum sinal",
        transition:
          "A comparação faz qualquer movimento dela parecer mais importante que o que ele realmente faz com você.",
        value: "replacement",
      },
      {
        image: "/images/quiz/pain/pain-guilt-v1.webp",
        label: "Pensar que eu mesma destruí a última chance por ansiedade",
        transition:
          "A culpa empurra você para explicar demais. Cada nova explicação pode soar como mais pressão.",
        value: "guilt",
      },
      {
        image: "/images/quiz/pain/pain-second-option-v1.webp",
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
  brand: brandCopyPt,
  preview: previewCopyPt,
  intro: {
    eyebrow: "A CADA DIA QUE VOCÊ IMPROVISA, ELE APRENDE A SENTIR MENOS A SUA FALTA",
    headline: "Ele ainda não esqueceu você.",
    headlineAccent:
      "Mas o seu próximo erro pode ensinar ele a viver sem você.",
    subheadline:
      "Responda cinco perguntas e descubra o que está apagando o desejo dele, o que precisa interromper hoje e como voltar a ocupar a mente dele antes que a distância vire indiferença.",
    cta: "DESCOBRIR O QUE FAZER ANTES DE PERDÊ-LO",
    privacy:
      "Suas respostas são usadas só neste diagnóstico. Não pedimos nome, prints nem conversas.",
  },
  questions,
  loaderOne: {
    title: "Descobrindo o que está afastando ele e quanto da conexão ainda está vivo…",
    socialProof: {
      lead: "Mais de 2.847 mulheres",
      middle: "já trocaram a ansiedade por uma rota clara para",
      highlight: "recuperar o controle e reabrir a conexão",
    },
    states: [
      "Medindo quanto acesso emocional você ainda tem…",
      "Identificando o erro que está reforçando a distância…",
      "Calculando o risco de perder a janela que ainda existe…",
      "Preparando o movimento que você precisa fazer antes de voltar ao chat…",
    ],
    captions: [
      "Você não precisa de outra frase. Precisa parar de ativar a resistência dele.",
      "Seu próximo movimento pode despertar curiosidade ou confirmar a distância.",
      "Em sete dias, cada decisão precisa aproximar você de uma resposta diferente.",
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
      "Ele não precisa esquecer toda a história para se afastar. Só precisa associar a sua presença a pressão, ansiedade ou a uma conversa que não quer viver de novo.",
      "Se você repetir o mesmo padrão, pode dar a ele a última confirmação que faltava para fechar a porta. Haz Que Vuelva™ muda a experiência que ele espera de você antes que a distância vire indiferença, para que a sua ausência volte a gerar curiosidade, tensão e vontade de se aproximar.",
    ],
    needs: [
      "o que parar hoje",
      "se o canal permite escrever, responder ou esperar",
      "qual sinal observar antes do próximo passo",
      "quando avançar e quando não fazer nada",
    ],
    cta: "QUERO IMPEDIR QUE ESSA JANELA SE FECHE",
    microcopy:
      "Já identificamos o que está jogando contra você. Agora preciso saber o que você quer provocar nele.",
  },
  desire: {
    title:
      "Além de descobrir o erro que está afastando ele, você quer usar os próximos sete dias para fazer a sua ausência pesar, reacender o desejo e tornar a vontade dele de voltar cada vez mais difícil de ignorar?",
    options: [
      {
        label:
          "Sim. Quero que ele sinta a minha falta e volte a me procurar por vontade própria",
        value: "desire_missing",
      },
      {
        label:
          "Sim. Quero uma rota simples para despertar isso sem precisar correr atrás dele",
        value: "desire_control",
      },
    ],
  },
  commitment: {
    title:
      "Se um único impulso pode fechar a última janela que ainda existe, você se compromete a seguir sua rota por sete dias antes de voltar a agir por ansiedade?",
    options: [
      {
        label: "Sim. Quero parar de perseguir respostas e fazer cada movimento jogar a meu favor",
        value: "commit_route",
      },
      {
        label: "Sim. Quero saber exatamente o que fazer quando a ansiedade tentar me sabotar",
        value: "commit_simple",
      },
    ],
  },
  loaderTwo: {
    title: "Construindo os próximos sete dias para você parar de empurrar ele para longe…",
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
