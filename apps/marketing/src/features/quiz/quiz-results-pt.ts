import type { QuizCopy } from "@/features/quiz/quiz-contracts";

type ResultCopy = Pick<
  QuizCopy,
  "demonstration" | "faq" | "pitch" | "result" | "routes" | "summaries" | "ui"
>;

export const resultCopyPt: ResultCopy = {
  demonstration: {
    headline:
      "Você não precisa ter um caso fácil. Precisa parar de usar a mesma resposta para situações completamente diferentes.",
    subheadline:
      "Veja por que um único conselho pode ajudar uma mulher e destruir a oportunidade de outra.",
    cases: [
      {
        eyebrow: "CASO · BLOQUEIO",
        description:
          "Ele bloqueou depois de três mensagens seguidas. Mandar uma quarta explicação não demonstra amor: reforça a pressão que ele tentou cortar.",
        decision:
          "Retirar pressão, não buscar atalhos e só preparar reabertura se o canal voltar a ser legítimo.",
        proof: "routes",
      },
      {
        eyebrow: "CASO · CONTATO FRIO",
        description:
          "Ele ainda responde, mas com frases curtas e sem iniciar. Sumir 30 dias por regra pode matar o pouco contexto que existe. Cobrar interesse também.",
        decision:
          "Igualar intensidade, responder sem puxar definição e observar se ele investe espontaneamente.",
        proof: "scale",
      },
      {
        eyebrow: "CASO · OUTRA MULHER",
        description:
          "Existe outra mulher e você acompanha cada história, comparação e sinal. Competir ou provocar ciúme faz ela dirigir toda a estratégia.",
        decision:
          "Separar fatos de suspeitas, parar a triangulação e medir só o que ele oferece diretamente.",
        proof: "decision",
      },
    ],
    dynamicLabels: [
      "Sua rota inicial",
      "O erro que mais pode fechar a porta",
      "A primeira decisão que vamos preparar",
    ],
    cta: "QUERO UMA ROTA PARA O MEU CASO",
  },
  result: {
    confirmation: "SEU DIAGNÓSTICO INICIAL ESTÁ PRONTO!",
    titlePrefix: "Sua rota é",
    labels: {
      contact: "Estado do contato",
      distance: "Tempo de distância",
      action: "Ação que mais colocou pressão",
      pain: "Dor que está dirigindo seus impulsos",
      index: "Índice de Distância Emocional",
    },
    disclaimer:
      "Este número não mede amor nem garante que ele vai voltar. Mostra a distância e a pressão declaradas para você escolher uma ação proporcional.",
    timelineTitle: "O que você pode mudar a partir de hoje",
    timeline: [
      {
        label: "HOJE",
        text: "Você identifica e interrompe a ação que aumenta a distância.",
      },
      {
        label: "24 HORAS",
        text: "Executa a primeira decisão compatível com sua rota.",
      },
      {
        label: "DIAS 2–5",
        text: "Observa canal e reciprocidade sem inventar significados.",
      },
      {
        label: "DIA 7",
        text: "Decide escrever, responder, esperar ou sair do ciclo.",
      },
    ],
  },
  routes: {
    gray: {
      publicName: "Porta fechada",
      prediagnosisHeadline:
        "Seu caso não precisa de outra explicação. Precisa retirar pressão antes que o silêncio vire rejeição definitiva.",
      headline:
        "Ele está fechando o canal. Insistir agora pode transformar distância em rejeição.",
      diagnosis: [
        "Seu caso não se resolve com uma mensagem mais convincente. Quando existe bloqueio ou silêncio completo, cada tentativa por outra rede, número ou pessoa pode confirmar que se afastar foi a única forma de parar a pressão.",
        "A primeira vitória não é conseguir uma resposta; é parar de criar novos motivos para ele se proteger de você.",
      ],
      firstAction:
        "Não buscar canal alternativo. Não enviar nova explicação. Registrar o que disparou a última tentativa e preparar uma pausa com critério.",
      bridge:
        "Haz Que Vuelva™ mostra como atravessar os próximos sete dias sem perseguir e como reconhecer uma abertura legítima.",
      cta: "QUERO MINHA ROTA PARA PARAR DE FECHAR A PORTA",
    },
    yellow: {
      publicName: "Canal frágil",
      prediagnosisHeadline:
        "Ainda existe um canal, mas ele está tão frágil que uma mensagem ansiosa pode fechá-lo.",
      headline:
        "Ainda existe contato. Mas ele está medindo quanto espaço terá se voltar a se aproximar.",
      diagnosis: [
        "Uma resposta curta, uma visualização ou um “oi” não significam que a relação voltou. Também não significam que você deve sumir por 30 dias.",
        "Sua oportunidade está em igualar a intensidade que ele oferece e deixar o próximo sinal vir de investimento observável.",
      ],
      firstAction:
        "Reduzir seu próximo movimento ao tamanho real do canal. Se ele não perguntou nada, não transformar resposta fria em conversa forçada.",
      bridge:
        "Haz Que Vuelva™ organiza quando responder, quando encerrar com leveza e qual sinal precisa aparecer antes de avançar.",
      cta: "QUERO PROTEGER O CANAL QUE AINDA EXISTE",
    },
    green: {
      publicName: "Abertura real",
      prediagnosisHeadline:
        "Existe abertura observável. Seu maior risco agora é acelerar e pedir definição antes da hora.",
      headline:
        "Existe abertura observável. Seu maior perigo agora é querer transformá-la em definição imediata.",
      diagnosis: [
        "Ele inicia, sustenta ou demonstra curiosidade. Isso é melhor que cortesia, mas ainda não é reparação.",
        "Se você pede garantia ou o passado resolvido antes de existir consistência, pode transformar curiosidade em nova pressão.",
      ],
      firstAction:
        "Responder com proporção, não abrir a história inteira de uma vez e observar se ele sustenta o próximo movimento sem ser empurrado.",
      bridge:
        "Haz Que Vuelva™ entrega a escala R0–R4 para diferenciar abertura, investimento e reparação.",
      cta: "QUERO SABER COMO AVANÇAR SEM ACELERAR ELE",
    },
    third_person: {
      publicName: "Interferência de outra mulher",
      prediagnosisHeadline:
        "A outra mulher está ocupando mais espaço nas suas decisões do que os sinais reais dele.",
      headline:
        "A outra mulher pode existir. O maior risco é deixar que ela controle cada decisão sua.",
      diagnosis: [
        "Quando você compara, investiga ou provoca ciúme, deixa de olhar o que importa: o que ele oferece diretamente, com clareza e consistência.",
        "Sua rota separa o que foi confirmado, o que você está inferindo e o que ele faz com você sem triangulação.",
      ],
      firstAction:
        "Não investigar, não competir e não publicar indireta. Anotar os fatos comprovados e retirar qualquer ação movida por comparação.",
      bridge:
        "Haz Que Vuelva™ entrega a decisão inicial sem ensinar a vigiar, atacar ou romper outra relação.",
      cta: "QUERO PARAR DE COMPETIR E RECUPERAR MINHA POSIÇÃO",
    },
    logistics: {
      publicName: "Contato funcional",
      prediagnosisHeadline:
        "Ele responde por obrigação. Agora você precisa separar contato funcional de interesse emocional.",
      headline:
        "Ele responde porque existe algo para resolver. Isso ainda não diz se há uma porta emocional.",
      diagnosis: [
        "Filhos, trabalho, dinheiro ou patrimônio mantêm o canal aberto. Misturar logística com reconquista faz qualquer resposta parecer esperança.",
        "O sinal emocional precisa aparecer fora da obrigação e se manter sem que você force.",
      ],
      firstAction:
        "Separar mensagem funcional da emocional. Resolver o necessário sem nostalgia, cobrança ou conversa sobre a relação.",
      bridge:
        "Haz Que Vuelva™ mostra como preservar o canal funcional e qual sinal deve existir antes de testar uma reabertura emocional.",
      cta: "QUERO SEPARAR OBRIGAÇÃO DE INTERESSE REAL",
    },
    red: {
      publicName: "Pausa estratégica",
      prediagnosisHeadline:
        "Seu caso exige uma rota sem contato: primeiro recuperar o controle, depois avaliar qualquer sinal.",
      headline:
        "Seu próximo passo não é insistir: é parar de piorar o canal e recuperar o controle.",
      diagnosis: [
        "Se ele pediu que você não entre em contato ou existe uma restrição legal, qualquer possibilidade futura começa pelo respeito a esse limite. Buscar outro número, conta ou intermediário só aumenta a pressão.",
        "Nesta rota, o protocolo não serve para enviar mensagens. Ele serve para conter o impulso, organizar os fatos e decidir com clareza durante os próximos sete dias.",
      ],
      firstAction:
        "Não entrar em contato nem buscar outro canal. Registrar o que disparou o último impulso e começar uma pausa deliberada de sete dias.",
      bridge:
        "Haz Que Vuelva™ pode guiar essa pausa: mostra o que não fazer, como organizar os sinais e quando um limite significa que você deve manter distância.",
      cta: "QUERO UMA ROTA PARA PARAR DE IMPROVISAR",
    },
  },
  pitch: {
    headline:
      "Seu diagnóstico mostrou o problema. Haz Que Vuelva™ guia você pelos próximos sete dias para não voltar a improvisar.",
    paragraphs: [
      "Seu resultado já entregou uma primeira decisão. A parte difícil começa quando aparece a ansiedade de mudar o plano, mandar “só mais uma coisa” ou transformar qualquer sinal em oportunidade.",
      "A Ventana de Memoria Afectiva™ não é diagnóstico cerebral. É um modelo para reconhecer quando uma interação reforça pressão e quando pode criar uma experiência mais leve e coerente.",
    ],
    bullets: [
      "o que parar hoje",
      "como ler o estado real do canal",
      "quando escrever, responder ou esperar",
      "qual mensagem usar quando houver abertura",
      "como medir reciprocidade sem confundir saudade com reparação",
      "como avançar sem implorar, perseguir ou perder dignidade",
    ],
    method: [
      "R · Regula o impulso que faz você agir por ansiedade",
      "E · Examina sua rota e o estado do canal",
      "G · Gera uma pequena prova de mudança real",
      "R · Reabre só quando existe uma porta legítima",
      "E · Entra em sintonia com a reciprocidade demonstrada",
      "S · Sintoniza proximidade sem acelerar",
      "A · Acorda reparação ou toma uma decisão clara",
    ],
    items: [
      {
        title: "Diagnóstico e seis rotas",
        description: "com primeira ação compatível com o seu cenário.",
      },
      {
        title: "Protocolo completo de sete dias",
        description: "uma decisão de cada vez, sem improvisar.",
      },
      {
        title: "Árvore escrever / responder / esperar",
        description: "para escolher antes de tocar no chat.",
      },
      {
        title: "Mapa V.I.V.E. e Escala R0–R4",
        description: "para medir viabilidade e reciprocidade observável.",
      },
      {
        title: "Mensagens essenciais e folha final",
        description: "somente quando sua rota permite contato.",
      },
    ],
    proofTitle: "Isto é o que existe dentro do protocolo",
    caption:
      "Você não compra uma promessa sobre o que ele vai fazer. Compra uma decisão clara sobre o que faz a partir de hoje.",
    price: "Acesso imediato por US$7 · pagamento único",
    guarantee:
      "7 dias de garantia. Se o protocolo não ajudar você a entender sua rota e executar a primeira decisão, solicite reembolso no prazo do checkout.",
    cta: "QUERO ACESSAR HAZ QUE VUELVA™ AGORA",
    microcopy:
      "Acesso após a aprovação. Os complementos do checkout são opcionais; o método principal está completo.",
  },
  faq: {
    title: "Antes de decidir",
    items: [
      {
        question: "Isso garante que ele vai voltar?",
        answer:
          "Não. Organiza o que você controla: parar o erro, ler o canal, escolher a próxima ação e medir reciprocidade.",
      },
      {
        question: "Serve se estou bloqueada?",
        answer:
          "Serve para saber o que não fazer e reconhecer abertura legítima. Não ensina a furar bloqueios nem procurar outro canal.",
      },
      {
        question: "E se existir outra mulher?",
        answer:
          "O protocolo entrega a decisão inicial. O aprofundamento é um complemento opcional no checkout.",
      },
      {
        question: "Vou receber mensagens prontas?",
        answer:
          "Inclui mensagens essenciais quando a rota permite contato. Não transforma uma frase em garantia.",
      },
      {
        question: "Quando recebo acesso?",
        answer: "Depois da aprovação do pagamento, pelo canal do checkout.",
      },
      {
        question: "Quanto custa?",
        answer: "US$7, pagamento único, com garantia de sete dias.",
      },
    ],
    cta: "COMEÇAR MEU PROTOCOLO DE SETE DIAS",
  },
  summaries: {
    state: {
      cold_contact: "vocês conversam, mas ele está frio ou responde cada vez menos",
      blocked: "ele bloqueou, parou de responder ou desapareceu",
      third_person: "há outra mulher ou medo concreto de substituição",
      intermittent: "ele se aproxima e volta a desaparecer",
      green_contact: "ele inicia e mantém algumas conversas",
      logistics: "só existe contato por assuntos obrigatórios",
      explicit_stop: "há limite explícito, medo ou restrição legal",
    },
    distance: {
      lt_7d: "menos de 7 dias",
      "1_4w": "entre 1 e 4 semanas",
      "1_3m": "entre 1 e 3 meses",
      gt_3m: "mais de 3 meses",
    },
    action: {
      long_message: "mensagem longa ou pedido de outra oportunidade",
      insistence: "insistência ou cobrança de resposta",
      blind_silence: "contato zero usado como regra universal",
      jealousy: "indiretas, ciúme ou vigilância",
      intimacy: "intimidade seguida de nova distância",
      pause: "nenhuma ação ainda",
    },
    pain: {
      silence: "o silêncio e o vazio",
      replacement: "o medo de ser substituída",
      guilt: "a culpa pela última oportunidade",
      second_option: "o medo de continuar como segunda opção",
    },
  },
  ui: {
    answerHint: "Escolha a opção mais parecida com a sua situação.",
    changeLanguage: "Alterar idioma",
    loadingProofLabel: "Página real do protocolo",
    restart: "Refazer o diagnóstico",
    skip: "Continuar",
  },
};
