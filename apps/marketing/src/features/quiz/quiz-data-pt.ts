import type {
  MainError,
  QuizQuestion,
  QuizRoute,
  ResultDefinition,
} from "@/features/quiz/quiz-data";

export const quizQuestionsPt: readonly QuizQuestion[] = [
  {
    id: "tiempo_ruptura",
    title: "Quanto tempo passou desde que a relação terminou ou esfriou?",
    microcopy:
      "O tempo não decide se vocês vão voltar, mas muda bastante o que uma mensagem pode provocar hoje.",
    transition:
      "Certo. Agora preciso saber se ainda existe um canal real entre vocês, não aquele que você gostaria que existisse.",
    options: [
      { label: "Menos de 7 dias", value: "menos_7d", tags: ["ruptura_reciente", "urgencia_alta"] },
      { label: "Entre 1 e 4 semanas", value: "1_4_semanas", tags: ["ruptura_activa"] },
      { label: "Entre 1 e 3 meses", value: "1_3_meses", tags: ["distancia_instalada"] },
      { label: "Mais de 3 meses", value: "mas_3_meses", tags: ["distancia_larga"] },
      {
        label: "Não terminamos, mas ele está frio e distante",
        value: "sin_ruptura_frio",
        tags: ["yellow_possible"],
      },
      {
        label: "Voltamos a conversar e depois ele se afasta de novo",
        value: "intermitente",
        tags: ["yellow_possible", "recaida"],
      },
    ],
  },
  {
    id: "estado_canal",
    title: "Como está o contato entre vocês hoje?",
    microcopy:
      "Ver seus stories ou desbloquear você não é o mesmo que procurar você e sustentar uma conversa.",
    transition:
      "Esta resposta pesa mais do que qualquer “sinal” isolado. Agora precisamos ver o que aconteceu na última vez em que você tentou se aproximar.",
    options: [
      { label: "Ele me bloqueou em todos os lugares", value: "bloqueo_total", tags: ["gray"] },
      {
        label: "Ele pediu claramente que eu não entre em contato",
        value: "no_contacto_explicito",
        tags: ["red"],
      },
      {
        label: "Ele vê minhas mensagens, mas responde frio ou me deixa no vácuo",
        value: "abierto_frio",
        tags: ["yellow"],
      },
      {
        label: "Ele responde por educação, mas nunca me procura",
        value: "abierto_cortes",
        tags: ["yellow"],
      },
      {
        label: "Ele inicia algumas conversas e mantém o assunto",
        value: "el_inicia",
        tags: ["green"],
      },
      {
        label: "Só falamos sobre filhos, trabalho ou alguma pendência",
        value: "solo_logistica",
        tags: ["logistics"],
      },
      {
        label: "Há ameaça, medo, assédio ou uma questão judicial",
        value: "riesgo_seguridad",
        tags: ["red"],
      },
    ],
  },
  {
    id: "intento_previo",
    title: "Desde que ele se afastou, qual foi a última coisa que você fez?",
    microcopy:
      "Escolha a opção mais parecida, mesmo que agora dê um pouco de vergonha admitir.",
    transition:
      "Um padrão já está aparecendo. Agora vamos tocar no ponto que mais muda uma decisão: se existe outra mulher ou apenas o medo de que exista.",
    options: [
      {
        label: "Enviei um texto longo explicando tudo",
        value: "texton",
        tags: ["presion", "main_error_texton"],
      },
      {
        label: "Implorei, insisti ou liguei várias vezes",
        value: "insistencia",
        tags: ["presion", "main_error_insistencia"],
      },
      {
        label: "Desapareci completamente, esperando que ele sentisse saudade",
        value: "contacto_cero_ciego",
        tags: ["main_error_silencio"],
      },
      {
        label: "Publiquei algo para causar ciúmes ou acompanhei as redes dele",
        value: "celos_vigilancia",
        tags: ["main_error_celos", "third_person_possible"],
      },
      {
        label: "Fomos para a cama e depois o silêncio voltou",
        value: "intimidad_intermitente",
        tags: ["recaida", "dignidad"],
      },
      {
        label: "Ainda não fiz nada; vim aqui antes de agir",
        value: "sin_accion",
        tags: ["neutral"],
      },
    ],
  },
  {
    id: "tercera_persona",
    title: "Sobre a outra mulher, o que está acontecendo de verdade?",
    microcopy:
      "Uma suspeita, uma relação confirmada e ser tratada como segunda opção não são o mesmo problema.",
    transition:
      "Entendi. Falta apenas uma pergunta, e ela pode evitar o seu próximo erro.",
    options: [
      {
        label: "Ele está com outra mulher e eu tenho certeza",
        value: "otra_confirmada",
        tags: ["third_person"],
      },
      { label: "Ele voltou com a ex", value: "volvio_ex", tags: ["third_person"] },
      {
        label: "Suspeito que exista alguém, mas não tenho provas",
        value: "otra_sospecha",
        tags: ["third_person_light"],
      },
      {
        label: "Ele me procura, mas me esconde ou não me dá um lugar claro",
        value: "segunda_opcion",
        tags: ["third_person", "dignidad"],
      },
      { label: "Não há outra mulher no meu caso", value: "sin_otra", tags: ["neutral"] },
      { label: "Prefiro não responder", value: "otra_no_declara", tags: ["neutral"] },
    ],
  },
  {
    id: "accion_urgente",
    title: "Se você fechasse este quiz agora, o que faria hoje?",
    microcopy:
      "Não escolha o que parece maduro. Escolha o que você realmente está prestes a fazer.",
    transition:
      "Pronto. Não envie nada ainda. Vamos cruzar o estado do canal, sua última tentativa e a presença de outra mulher.",
    options: [
      {
        label: "Eu enviaria uma mensagem longa",
        value: "enviar_texton_hoy",
        tags: ["main_error_texton"],
      },
      {
        label: "Eu ligaria ou iria procurá-lo",
        value: "buscar_sin_avisar",
        tags: ["risk_escalation"],
      },
      {
        label: "Eu publicaria algo para ele reagir",
        value: "provocar_celos_hoy",
        tags: ["main_error_celos"],
      },
      {
        label: "Eu olharia as redes dele ou as dela",
        value: "vigilar_hoy",
        tags: ["main_error_celos"],
      },
      {
        label: "Se ele escrevesse, eu responderia",
        value: "responder_si_escribe",
        tags: ["yellow_green"],
      },
      {
        label: "Eu esperaria para ver minha rota antes de agir",
        value: "esperar_ruta",
        tags: ["neutral"],
      },
    ],
  },
];

export const loadingMessagesPt = [
  "Analisando como está o canal entre vocês...",
  "Identificando qual ação pode afastá-lo ainda mais...",
  "Separando fatos sobre a outra mulher do que a ansiedade completa...",
  "Preparando sua primeira decisão...",
] as const;

export const commonOfferItemsPt = [
  { title: "Método R.E.G.R.E.S.A. 7D™", description: "um passo por dia para você parar de improvisar." },
  {
    title: "Árvore de decisão",
    description: "escrever, responder ou esperar conforme o estado real do canal.",
  },
  {
    title: "Rotas especiais",
    description: "bloqueio, contato frio, abertura, outra mulher e contato obrigatório.",
  },
  {
    title: "Mensagens essenciais",
    description: "somente com momento de uso, limite e próximo passo.",
  },
  {
    title: "Mapa de reciprocidade",
    description: "para não confundir visualização, sexo, nostalgia ou educação com reconciliação.",
  },
  {
    title: "Folha final",
    description: "avançar, esperar, reparar ou encerrar sem continuar se perdendo.",
  },
] as const;

export const resultsPt: Record<QuizRoute, ResultDefinition> = {
  red: {
    route: "red",
    label: "Segurança primeiro",
    headline: "Hoje sua prioridade é parar de se colocar em risco.",
    diagnosis:
      "Sua resposta ativou um limite claro: ameaça, medo, assédio, medida judicial ou um pedido explícito para não entrar em contato. Nesse cenário, escrever por outra conta, usar outro número, pedir ajuda a um amigo ou aparecer sem avisar pode piorar a situação para os dois.",
    decisionTitle: "O que fazer nas próximas 24 horas",
    decision: "",
    safetySteps: [
      "Não entre em contato com ele.",
      "Guarde provas se houver ameaça ou assédio.",
      "Conte a uma pessoa de confiança.",
      "Se houver perigo, procure apoio local, orientação jurídica ou serviços de emergência.",
      "Escreva o que queria dizer em uma nota privada, mas não envie.",
    ],
    closing:
      "Não vou transformar um limite de segurança em objeção de venda. Haz Que Vuelva™ não é indicado para tentar reabrir esse canal agora.",
    cta: "Buscar apoio e sair do quiz",
  },
  gray: {
    route: "gray",
    label: "Canal fechado",
    headline: "Neste momento, cada tentativa pode fazer com que ele veja seu nome e já espere mais pressão.",
    diagnosis:
      "O canal está fechado ou não apresenta um sinal legítimo de abertura. Talvez ele tenha bloqueado você, parado de responder ou pedido espaço. O impulso de mandar “só mais uma coisa” acalma você por alguns minutos; para ele, pode confirmar que se afastar era a única maneira de respirar.",
    decisionTitle: "Sua primeira decisão",
    decision:
      "Não procure uma entrada hoje. Nada de outro número, indiretas, amigos em comum ou uma frase “casual” com uma confissão escondida. Se ele aparecer, responda de forma breve. Se não aparecer, não fabrique um sinal.",
    pitch: [
      "O problema volta amanhã, quando a ansiedade negociar com você outra vez: “só vou olhar o perfil”, “só vou perguntar como ele está”, “só vou mandar esta frase”.",
      "Haz Que Vuelva™ entrega uma rota de 7 dias para interromper esse ciclo, identificar se o canal continua fechado e saber exatamente quando escrever, responder ou esperar. Inclui o Método R.E.G.R.E.S.A. 7D™, a árvore de decisão e as rotas para bloqueio, silêncio e contato frio.",
    ],
    cta: "Acessar minha rota de 7 dias por US$7",
    microcopy: "Acesso imediato · garantia de 7 dias · não ensina a contornar bloqueios.",
  },
  yellow: {
    route: "yellow",
    label: "Canal frágil",
    headline: "Existe conversa, mas uma palavra a mais pode levá-lo de volta ao silêncio.",
    diagnosis:
      "Ele pode ler, responder por educação ou aparecer de vez em quando. Isso basta para sua esperança correr, mas ainda não basta para falar sobre tudo. Quando ele entrega duas linhas e você entrega a relação inteira, o canal fica pesado novamente.",
    decisionTitle: "Sua primeira decisão",
    decision:
      "Se ele não escreveu, não abra uma conversa emocional hoje. Se escreveu, responda no mesmo nível de intensidade: breve, tranquila e sem pedir uma definição. Uma resposta fria não é o momento de cobrar o passado.",
    pitch: [
      "Seu caso precisa de sequência: quanto responder, quando parar, qual sinal permite avançar e como diferenciar educação de interesse.",
      "Haz Que Vuelva™ organiza essa sequência durante 7 dias com o Método R.E.G.R.E.S.A. 7D™, o mapa de abertura e mensagens que só aparecem quando sua rota permite contato.",
    ],
    cta: "Quero proteger esta abertura por US$7",
    microcopy: "Acesso imediato · garantia de 7 dias · método completo sem extras obrigatórios.",
  },
  green: {
    route: "green",
    label: "Existe abertura",
    headline: "Ele voltou a procurar você. O risco agora é correr e assustá-lo com tudo o que ficou guardado.",
    diagnosis:
      "Aqui existe um sinal melhor: ele inicia, pergunta ou sustenta a conversa. Pode haver curiosidade, nostalgia ou vontade de reparar. Você ainda não sabe qual dos três. Transformar essa abertura em uma conversa sobre voltar, prometer e definir tudo pode queimar o momento que você queria proteger.",
    decisionTitle: "Sua primeira decisão",
    decision:
      "Responda com a mesma energia que ele traz. Se ele abrir algo emocional, escute antes de cobrar. Se propuser um encontro, busque um contexto claro; uma noite intensa seguida de silêncio não é reconciliação.",
    pitch: [
      "Esta é a rota com maior oportunidade e, justamente por isso, precisa de mais precisão. Haz Que Vuelva™ orienta você a mostrar mudança sem implorar, medir reciprocidade e chegar a uma conversa real sem tentar resolver toda a relação de uma vez.",
      "Você recebe o Método R.E.G.R.E.S.A. 7D™, a escala de reciprocidade, o Teste Mínimo de Mudança e a decisão final para avançar, esperar ou parar.",
    ],
    cta: "Quero cuidar desta oportunidade por US$7",
    microcopy: "Acesso imediato · garantia de 7 dias · não garante a volta.",
  },
  logistics: {
    route: "logistics",
    label: "Contato obrigatório",
    headline: "Ele responde porque precisa. Você ainda não sabe se ele também quer se aproximar.",
    diagnosis:
      "Filhos, trabalho, dinheiro ou pendências mantêm um canal aberto, mas esse canal é funcional. Sempre que você mistura uma coordenação com cobranças, ciúmes ou nostalgia, ele aprende que até falar do necessário traz uma carga emocional.",
    decisionTitle: "Sua primeira decisão",
    decision:
      "Responda apenas ao assunto prático. Mensagem breve, informação clara e encerramento limpo. Se surgir um sinal emocional separado, avalie depois; não force isso em uma conversa sobre horários, pagamentos ou filhos.",
    pitch: [
      "Haz Que Vuelva™ mostra como separar o canal funcional do emocional, o que responder sem parecer fria nem desesperada e quando existe uma abertura que não depende da obrigação.",
      "O plano inclui a rota logística dentro do Método R.E.G.R.E.S.A. 7D™, a árvore escrever / responder / esperar e limites específicos para não usar filhos, trabalho ou pendências como ponte emocional.",
    ],
    cta: "Quero separar contato e reconexão por US$7",
    microcopy: "Acesso imediato · garantia de 7 dias · não usa terceiros para pressionar.",
  },
  third_person: {
    route: "third_person",
    label: "Existe outra mulher",
    headline: "Aceitar migalhas por medo de perdê-lo pode machucar mais do que a outra mulher.",
    diagnosis:
      "Pode haver uma relação confirmada, uma volta com a ex, uma suspeita ou um lugar escondido na vida dele onde você só entra quando ele se sente sozinho. Enquanto você olha o perfil dela e pensa em como competir, ele continua recebendo sua atenção sem oferecer clareza.",
    decisionTitle: "Sua primeira decisão",
    decision:
      "Não acompanhe as redes deles nem confronte a outra mulher. Separe fatos de suposições. Se ele está com outra pessoa, não tente romper essa relação. Se procura você escondido ou apenas à noite, não transforme desejo em prova de que ele escolheu você.",
    pitch: [
      "Sua rota começa recuperando seu critério antes de buscar conexão. Haz Que Vuelva™ orienta você durante 7 dias para sair da comparação, medir o lugar que ele realmente oferece e reconhecer quando uma abertura merece resposta e quando apenas mantém você como segunda opção.",
      "Inclui o Método R.E.G.R.E.S.A. 7D™, a rota de terceira pessoa, o semáforo de reciprocidade e a primeira decisão para não agir a partir do medo de ser substituída.",
    ],
    cta: "Quero minha rota sem competir por US$7",
    microcopy: "Acesso imediato · garantia de 7 dias · não ensina a vigiar, atacar ou romper relações.",
  },
};

export const mainErrorCopyPt: Record<MainError, string> = {
  texton:
    "Você está tentando resolver o medo com mais palavras. Ele pode ler pressão onde você tenta demonstrar amor.",
  insistencia: "Sua urgência está pedindo presença quando o canal precisa de espaço.",
  contacto_cero_ciego:
    "Você está usando o silêncio como aposta, sem saber se ele sente sua ausência ou apenas se acostuma com ela.",
  celos_vigilancia:
    "A outra mulher já ocupa espaço demais nas suas decisões. Vigiá-la não devolve seu lugar; apenas aumenta o pânico.",
  intimidad_intermitente:
    "A química continua viva, mas ele ainda não mostra que quer reconstruir a relação.",
  none:
    "Você chegou antes de cometer o próximo erro. Essa vantagem vale mais do que parece.",
};
