import type { QuizCopy } from "@/features/quiz/quiz-contracts";

type ResultCopy = Pick<
  QuizCopy,
  "demonstration" | "faq" | "pitch" | "result" | "routes" | "summaries" | "ui"
>;

export const resultCopyPt: ResultCopy = {
  demonstration: {
    headline:
      "O problema não é ele não sentir nada. É cada movimento ansioso poder fazer com que ficar longe de você pareça um alívio.",
    subheadline:
      "E enquanto esse alívio se repete, ele aprende a resistir à sua presença em vez de sentir sua falta. É isso que você precisa interromper antes de voltar ao chat.",
    cases: [
      {
        eyebrow: "QUANDO VOCÊ BUSCA ALÍVIO",
        description:
          "Uma mensagem longa, outra explicação ou pedir mais uma chance pode acalmar você por minutos. Para ele, pode confirmar que voltar significa reviver a mesma pressão.",
        decision:
          "Resultado: ele sente alívio quando se afasta e aprende a se proteger do seu próximo contato.",
        proof: "routes",
      },
      {
        eyebrow: "QUANDO VOCÊ TENTA PROVOCAR",
        description:
          "Sumir sem estratégia, postar indiretas ou provocar ciúme não cria desejo sozinho. Se ele percebe a manobra, só enxerga ansiedade disfarçada de controle.",
        decision:
          "Resultado: a atenção dele continua em se defender, não em se perguntar por que você parece diferente.",
        proof: "scale",
      },
      {
        eyebrow: "QUANDO VOCÊ MUDA O PADRÃO",
        description:
          "Quando você para de reagir como ele espera e faz o movimento proporcional ao canal, a pressão cai. Sua presença deixa de parecer uma repetição do passado.",
        decision:
          "Resultado: a resistência perde força e podem voltar a surgir curiosidade, contraste e vontade de se aproximar.",
        proof: "decision",
      },
    ],
    dynamicLabels: [
      "O que ainda existe entre vocês",
      "O movimento que pode destruir isso",
      "O primeiro passo para mudar o padrão",
    ],
    cta: "QUERO FAZER MEU PRÓXIMO MOVIMENTO JOGAR A MEU FAVOR",
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
        "Você não precisa enviar outra explicação. Precisa retirar pressão antes que o silêncio vire rejeição definitiva.",
      headline:
        "Ele está fechando o canal. Insistir agora pode transformar distância em rejeição.",
      diagnosis: [
        "Isso não se resolve com uma mensagem mais convincente. Quando existe bloqueio ou silêncio completo, cada tentativa por outra rede, número ou pessoa pode confirmar que se afastar foi a única forma de parar a pressão.",
        "A primeira vitória não é conseguir uma resposta; é parar de criar novos motivos para ele se proteger de você.",
      ],
      firstAction:
        "Não buscar canal alternativo. Não enviar nova explicação. Registrar o que disparou a última tentativa e preparar uma pausa com critério.",
      bridge:
        "Haz Que Vuelva™ mostra como atravessar os próximos sete dias sem perseguir e como reconhecer uma abertura legítima.",
      costOfInaction:
        "Se você voltar ao chat sem critério, cada atalho, explicação ou tentativa por outro canal pode transformar um afastamento temporário em rejeição consolidada.",
      offerHeadline:
        "Seu primeiro ganho não é uma resposta. É parar de entregar novos motivos para ele manter a porta fechada.",
      offerLead:
        "Na rota Porta Fechada, Haz Que Vuelva™ organiza uma pausa com critério e mostra quais sinais precisam existir antes de qualquer reabertura.",
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
      costOfInaction:
        "Se você tratar cada resposta curta como oportunidade, vai colocar sobre um canal frágil uma pressão que ele ainda não consegue sustentar.",
      offerHeadline:
        "Você ainda tem acesso a ele. Agora precisa impedir que a ansiedade transforme essa abertura na confirmação de que ficar longe de você é melhor.",
      offerLead:
        "O Haz Que Vuelva organiza a intensidade, o tempo e cada próxima decisão para ele deixar de encontrar a mesma pressão e começar a perceber uma versão sua que não esperava.",
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
      costOfInaction:
        "Se você pedir definição antes de existir consistência, pode converter curiosidade em pressão e uma abertura real em novo afastamento.",
      offerHeadline:
        "Você não precisa fazê-lo voltar. Precisa impedir que a pressa estrague a abertura que ele já começou a mostrar.",
      offerLead:
        "Na rota Abertura Real, Haz Que Vuelva™ mostra como responder com proporção, medir investimento e avançar sem acelerar a relação.",
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
      costOfInaction:
        "Enquanto você monitora, compara ou tenta vencer a outra mulher, ela ocupa sua atenção e passa a dirigir uma estratégia que deveria pertencer a você.",
      offerHeadline:
        "Pare de competir por uma posição que só o comportamento dele pode confirmar.",
      offerLead:
        "Na rota Interferência de Outra Mulher, o protocolo separa fatos de medo e devolve sua atenção à única evidência que importa: reciprocidade direta.",
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
      costOfInaction:
        "Se você usar filhos, trabalho ou dinheiro para criar proximidade, qualquer resposta obrigatória vai alimentar esperança sem provar interesse.",
      offerHeadline:
        "Contato obrigatório não é abertura emocional. Misturar os dois mantém você presa em sinais que nunca foram promessas.",
      offerLead:
        "Na rota Contato Funcional, Haz Que Vuelva™ separa logística de reconexão e define o sinal mínimo antes de qualquer avanço emocional.",
      cta: "QUERO SEPARAR OBRIGAÇÃO DE INTERESSE REAL",
    },
    red: {
      publicName: "Pausa estratégica",
      prediagnosisHeadline:
        "Sua situação exige uma rota sem contato: primeiro recuperar o controle, depois avaliar qualquer sinal.",
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
      costOfInaction:
        "Buscar outro número, conta ou intermediário não reabre o canal: aumenta a pressão, destrói confiança e pode agravar uma restrição que precisa ser respeitada.",
      offerHeadline:
        "Nesta rota, vencer não significa enviar a mensagem certa. Significa recuperar o controle antes que o impulso decida por você.",
      offerLead:
        "Na rota Pausa Estratégica, Haz Que Vuelva™ funciona como um protocolo de contenção, leitura de fatos e decisão sem contato.",
      cta: "QUERO UMA ROTA PARA PARAR DE IMPROVISAR",
    },
  },
  pitch: {
    headline:
      "Seu diagnóstico mostrou o problema. Haz Que Vuelva™ guia você pelos próximos sete dias para não voltar a improvisar.",
    paragraphs: [
      "Seu resultado já entregou uma primeira decisão. A parte perigosa começa quando seu cérebro busca alívio rápido e tenta negociar o plano com “só mais uma mensagem”.",
      "Haz Que Vuelva™ interrompe esse ciclo antes do chat: você identifica o estado do canal, executa uma decisão proporcional e só avança quando existe reciprocidade observável.",
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
    proofTitle: "Tudo o que você vai encontrar dentro do seu protocolo",
    caption:
      "Você não compra uma promessa sobre o que ele vai fazer. Compra uma decisão clara sobre o que faz a partir de hoje.",
    price: "Acesso imediato por US$7",
    guarantee:
      "7 dias de garantia. Se o protocolo não ajudar você a entender sua rota e executar a primeira decisão, solicite reembolso no prazo do checkout.",
    cta: "QUERO ACESSAR HAZ QUE VUELVA™ AGORA",
    microcopy: "",
  },
  faq: {
    title: "Antes de decidir",
    items: [
      {
        question: "E se eu sentir que preciso escrever para ele hoje?",
        answer:
          "Esse impulso é justamente o momento em que você mais precisa de uma rota. Antes de abrir o chat, o protocolo ajuda a separar urgência emocional de abertura real e escolher o movimento que não adiciona mais pressão.",
      },
      {
        question: "Isso serve se ele me bloqueou?",
        answer:
          "Sim. Nessa rota, o primeiro objetivo não é procurar outra conta ou número. É parar de transformar o bloqueio em mais perseguição, recuperar o controle e entender quais sinais precisariam existir antes de uma reabertura legítima.",
      },
      {
        question: "E se existir outra mulher?",
        answer:
          "Sua rota separa fatos, suspeitas e reciprocidade direta. Assim, você deixa de competir com uma história que pode estar completando pelo medo e volta a olhar o que realmente orienta uma decisão: o comportamento dele com você.",
      },
      {
        question: "Funciona se ainda conversamos, mas ele está frio?",
        answer:
          "Esse é um dos cenários centrais do protocolo. Você aprende a igualar a intensidade real do canal, encerrar conversas sem arrastá-las e observar se ele volta a investir sem você precisar empurrá-lo.",
      },
      {
        question: "E se só falamos por filhos, trabalho ou dinheiro?",
        answer:
          "O protocolo ajuda a separar contato obrigatório de interesse emocional. Você resolve o necessário sem usar a logística como desculpa para buscar proximidade e aprende qual sinal precisa aparecer fora da obrigação.",
      },
      {
        question: "Vou receber mensagens prontas para enviar?",
        answer:
          "Você recebe mensagens essenciais, mas apenas para os momentos em que sua rota permite contato. A força não está em uma frase mágica; está em usar a frase certa, na intensidade certa e no momento certo.",
      },
      {
        question: "Preciso desaparecer por 30 dias?",
        answer:
          "Não. O Haz Que Vuelva não aplica contato zero como regra universal. Algumas rotas exigem pausa; outras exigem resposta proporcional. O diagnóstico existe para você não usar o mesmo conselho em situações diferentes.",
      },
      {
        question: "E se eu já cometi muitos erros e pedi outra chance?",
        answer:
          "Você não pode apagar o que aconteceu, mas pode parar de confirmá-lo. Os próximos sete dias servem para interromper o padrão que ele já espera e criar uma experiência diferente antes de tentar se aproximar novamente.",
      },
      {
        question: "O protocolo garante que ele vai voltar?",
        answer:
          "Ninguém pode garantir a decisão de outra pessoa. O protocolo organiza o que você controla: parar o erro, ler o canal, escolher a próxima ação e medir reciprocidade sem se perder em promessas.",
      },
      {
        question: "Quanto tempo preciso por dia?",
        answer:
          "A rota foi criada para decisões breves e executáveis. Você não precisa passar horas estudando; precisa abrir o material do dia, entender a decisão e aplicá-la sem negociar com a ansiedade.",
      },
      {
        question: "Posso seguir o protocolo pelo celular?",
        answer:
          "Sim. O material é digital e pode ser consultado pelo celular, tablet ou computador para ficar perto de você justamente quando surgir o impulso de improvisar.",
      },
      {
        question: "O que recebo exatamente ao entrar?",
        answer:
          "Você recebe o diagnóstico com seis rotas, o protocolo completo de sete dias, a árvore escrever ou responder ou esperar, o mapa V.I.V.E., a escala R0–R4, mensagens essenciais e a folha final de decisão.",
      },
      {
        question: "Quando recebo o acesso?",
        answer:
          "O acesso é liberado após a aprovação do pagamento pelo canal informado no checkout. Não existe envio físico nem espera por entrega.",
      },
      {
        question: "O pagamento é mensal?",
        answer:
          "Não. O acesso custa US$7 e não cria uma mensalidade recorrente.",
      },
      {
        question: "Como funciona a garantia de 7 dias?",
        answer:
          "Entre, descubra sua rota e aplique as primeiras decisões. Se dentro de sete dias sentir que o protocolo não entregou a clareza esperada, você pode solicitar o reembolso dentro do prazo de garantia.",
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
