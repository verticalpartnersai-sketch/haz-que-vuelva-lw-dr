import type { QuizPreviewCopy } from "@/features/quiz/quiz-contracts";

export const previewCopyPt: QuizPreviewCopy = {
  internalLabel: "PRÉVIA INTERNA",
  proof: {
    headline:
      "Se outras mulheres que estavam em uma situação muito pior que a sua conseguiram parar de perdê-lo e começar a reconquistá-lo em menos de sete dias, você também consegue.",
    body:
      "O que você verá agora não são histórias perfeitas. São mulheres que, justamente quando o medo mandava perseguir uma resposta, pararam de confirmar que se afastar era a opção mais fácil. Elas mudaram o padrão que ele esperava e voltaram a abrir espaço para curiosidade, contraste e vontade de se aproximar.",
    heroAlt:
      "Mulheres latino-americanas conversando em um encontro cotidiano de apoio",
    stories: [
      {
        id: "camila",
        imageAlt: "Casal mexicano conversando em casa",
        intro:
          "Camila havia sido bloqueada depois de enviar várias mensagens seguidas. Estava convencida de que qualquer silêncio significava que o tinha perdido para sempre.",
        messages: [
          "Você não faz ideia do que aconteceu.",
          "Segui a rota e parei de procurá-lo por outras contas, embora sentisse que ia explodir.",
          "No sexto dia, ele me desbloqueou e perguntou por que eu tinha desaparecido.",
          "Pela primeira vez, não respondi movida pelo medo. Fiz exatamente o que o protocolo indicava e agora voltamos a conversar sem que eu precise correr atrás dele.",
        ],
        conclusion:
          "Não foi insistir mais que reabriu a porta. Foi deixar de confirmar que se afastar era a única forma de interromper a pressão.",
      },
      {
        id: "valentina",
        imageAlt: "Casal colombiano conversando em um encontro cotidiano",
        intro:
          "Valentina via o ex se aproximar de outra mulher enquanto acompanhava cada story, comparação e sinal. Quanto mais medo sentia, mais tentava provocar uma reação.",
        messages: [
          "Eu achava que, se parasse de competir, iria perdê-lo de vez.",
          "O protocolo me fez separar o que eu sabia de tudo o que estava imaginando.",
          "Parei com as indiretas e segui minha rota durante os sete dias.",
          "Ontem ele voltou a me procurar e pediu para conversarmos pessoalmente. Desta vez, não senti que precisava convencê-lo de nada.",
        ],
        conclusion:
          "Quando deixou de colocar a outra mulher no centro das decisões, recuperou a posição que o medo estava destruindo.",
      },
      {
        id: "sofia",
        imageAlt: "Casal mexicano sorrindo durante uma conversa",
        intro:
          "Sofía ainda recebia respostas, mas transformava cada “oi” em uma conversa longa, intensa e cheia de explicações.",
        messages: [
          "Antes, eu sentia que cada resposta dele era minha última oportunidade.",
          "Desta vez, igualei a intensidade, respondi sem pressão e encerrei a conversa como minha rota indicava.",
          "No dia seguinte, foi ele quem voltou a me escrever.",
          "Hoje ele disse que sente que estou diferente e quer me encontrar. Não consigo acreditar no quanto eu o estava afastando por ansiedade.",
        ],
        conclusion:
          "A conversa não mudou porque ela encontrou uma frase mágica. Mudou porque deixou de transformar cada pequena abertura em uma nova carga emocional.",
      },
    ],
    cta: "QUERO OS MESMOS RESULTADOS!",
  },
  commitment: {
    eyebrow: "SEU PRÓXIMO MOVIMENTO PODE MUDAR TUDO",
    title:
      "Você já viu que mulheres em situações mais difíceis pararam de perder terreno quando seguiram uma rota. A oportunidade que ainda existe pode se fechar com outro impulso. Você vai improvisar de novo ou seguir por sete dias o protocolo criado para começar a reconquistá-lo?",
    options: [
      {
        label:
          "Sim. Quero parar de empurrá-lo para longe e fazer com que ele volte a sentir minha ausência.",
        value: "commit_route",
      },
      {
        label:
          "Sim. Quero saber exatamente o que fazer para começar a reconquistá-lo.",
        value: "commit_simple",
      },
    ],
  },
  loader: {
    title:
      "Construindo os seus próximos sete dias para você parar de empurrá-lo para longe…",
  },
  mirror: {
    statePrefix: "Você marcou que",
    distancePrefix: "que isso já dura",
    actionPrefix: "e que seu último movimento foi",
    conclusion:
      "Isso revela exatamente o que está fazendo a distância crescer e o que você precisa interromper antes de voltar a procurá-lo.",
  },
  routeHeadlines: {
    gray:
      "Hoje a porta está fechada. Se você voltar a perseguir uma resposta, pode transformar o silêncio dele na certeza de que se afastar de você foi a decisão certa.",
    yellow:
      "A conexão entre vocês ainda não morreu. Mas cada mensagem enviada pelo medo pode ensiná-lo a sentir alívio longe de você. Se quer reconquistá-lo, precisa mudar esse padrão antes que a oportunidade vire indiferença.",
    green:
      "Ele já abriu uma pequena porta. Se você tentar transformá-la em relacionamento antes da hora, pode destruir em minutos a oportunidade que esperou semanas para recuperar.",
    third_person:
      "Cada vez que compete com a outra mulher, você entrega a ela o controle das suas emoções e se afasta da versão de si que ele poderia voltar a desejar.",
    logistics:
      "Ele ainda responde, mas hoje faz isso por obrigação. Seu próximo movimento decide se continuará vendo você como um problema a resolver ou como uma mulher de quem deseja voltar a se aproximar.",
    red:
      "Agora, insistir não o aproxima: pode destruir sua dignidade e qualquer possibilidade futura. Recuperar o controle é o primeiro passo para parar de perder a si mesma enquanto tenta recuperá-lo.",
  },
  pitch: {
    heroLead:
      "Você não precisa de outra frase improvisada. Precisa saber o que interromper, qual sinal esperar e qual movimento protege a oportunidade que ainda existe.",
    mechanism: {
      eyebrow: "O PADRÃO QUE ESTÁ AUMENTANDO A DISTÂNCIA",
      body:
        "Ele não precisa de outra versão da mesma pressão. Precisa experimentar uma versão sua que já não reage como ele espera. Quando você muda o padrão, deixa de reforçar a distância e começa a criar contraste, curiosidade e uma nova possibilidade de aproximação.",
    },
    reveal: {
      eyebrow: "SUA ROTA DE SETE DIAS",
      brand: "HAZ QUE VUELVA™",
      description:
        "O protocolo de sete dias para parar de improvisar e começar a reconquistá-lo com uma rota criada para a sua situação.",
    },
    commitmentLead: {
      commit_route:
        "Você escolheu parar de empurrá-lo para longe. Por isso, sua rota começa interrompendo o impulso que hoje está aumentando a distância.",
      commit_simple:
        "Você escolheu saber exatamente o que fazer. Por isso, sua rota organiza cada decisão antes que a ansiedade decida por você.",
    },
    cost: {
      eyebrow: "O que pode custar voltar a improvisar",
      body:
        "A próxima mensagem ansiosa não é apenas mais uma mensagem. Pode ser a confirmação que ele procurava para continuar distante. Seguir improvisando pode custar a última abertura que você ainda não aprendeu a reconhecer.",
    },
    offer: {
      price: "Acesso imediato por US$7,90",
      payment: "Pagamento único",
      guaranteeTitle: "Você tem 7 dias para testar o Haz Que Vuelva sem risco",
      guarantee:
        "Entre no protocolo, descubra sua rota e aplique as primeiras decisões com calma. Se, nos próximos sete dias, sentir que o Haz Que Vuelva não entregou a clareza que esperava, você poderá solicitar o reembolso dentro do prazo de garantia. O risco fica conosco; você só precisa decidir se continuar improvisando custa mais.",
      cta: "QUERO COMEÇAR MEU PROTOCOLO DE SETE DIAS",
    },
  },
};
