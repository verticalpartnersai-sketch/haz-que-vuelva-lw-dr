import type { QuizCopy } from "@/features/quiz/quiz-contracts";

type ResultCopy = Pick<
  QuizCopy,
  "demonstration" | "faq" | "pitch" | "result" | "routes" | "summaries" | "ui"
>;

export const resultCopyEn: ResultCopy = {
  demonstration: {
    headline:
      "You do not need an easy case. You need to stop using the same answer for completely different situations.",
    subheadline:
      "See why one piece of advice can help one woman and destroy another woman’s opening.",
    cases: [
      {
        eyebrow: "CASE · BLOCKED",
        description:
          "He blocked her after three messages in a row. A fourth explanation does not prove love; it reinforces the pressure he tried to stop.",
        decision:
          "Remove pressure, stop looking for shortcuts, and prepare to reopen only if the channel becomes legitimate.",
        proof: "routes",
      },
      {
        eyebrow: "CASE · COLD CONTACT",
        description:
          "He still replies, but briefly and never initiates. Disappearing for 30 days by rule can kill the little context that remains. Demanding interest can too.",
        decision:
          "Match intensity, reply without forcing a definition, and watch whether he invests spontaneously.",
        proof: "scale",
      },
      {
        eyebrow: "CASE · ANOTHER WOMAN",
        description:
          "There is another woman and every story, comparison, and signal is being monitored. Competing or provoking jealousy lets her run the strategy.",
        decision:
          "Separate facts from suspicion, stop the triangle, and measure only what he offers directly.",
        proof: "decision",
      },
    ],
    dynamicLabels: [
      "Your initial route",
      "The mistake most likely to close it",
      "The first decision we will prepare",
    ],
    cta: "I WANT A ROUTE FOR MY CASE",
  },
  result: {
    confirmation: "YOUR INITIAL DIAGNOSIS IS READY!",
    titlePrefix: "Your route is",
    labels: {
      contact: "State of contact",
      distance: "Time at a distance",
      action: "Action that added the most pressure",
      pain: "Pain driving your impulses",
      index: "Emotional Distance Index",
    },
    disclaimer:
      "This number does not measure love or guarantee his return. It reflects the distance and pressure you reported so you can choose a proportional action.",
    timelineTitle: "What you can change starting today",
    timeline: [
      {
        label: "TODAY",
        text: "Identify the mistake and stop the action increasing distance.",
      },
      {
        label: "24 HOURS",
        text: "Execute one first decision compatible with your route.",
      },
      {
        label: "DAYS 2–5",
        text: "Observe the channel and reciprocity without inventing meaning.",
      },
      {
        label: "DAY 7",
        text: "Decide whether to write, reply, wait, or leave the cycle.",
      },
    ],
  },
  routes: {
    gray: {
      publicName: "Closed door",
      prediagnosisHeadline:
        "Your case does not need another explanation. It needs less pressure before silence turns into firm rejection.",
      headline:
        "He is closing the channel. Pushing now can turn distance into rejection.",
      diagnosis: [
        "A more convincing message will not solve this. When there is a block or complete silence, each attempt through another account, number, or person can confirm that distance was the only way to stop the pressure.",
        "The first win is not getting a reply. It is stopping the creation of new reasons for him to protect himself from you.",
      ],
      firstAction:
        "Do not find another channel. Do not send another explanation. Record what triggered your last attempt and prepare a deliberate pause.",
      bridge:
        "Haz Que Vuelva™ shows you how to move through the next seven days without chasing and how to recognize a legitimate opening.",
      cta: "GIVE ME THE ROUTE THAT STOPS CLOSING THE DOOR",
    },
    yellow: {
      publicName: "Fragile channel",
      prediagnosisHeadline:
        "A channel still exists, but it is fragile enough that one anxious message can close it.",
      headline:
        "Contact still exists. But he is measuring how much room he will have if he moves closer.",
      diagnosis: [
        "A short reply, a view, or a “hi” does not mean the relationship is back. It also does not mean you should vanish for 30 days.",
        "Your opening is to match the intensity he offers and let the next signal come from observable investment.",
      ],
      firstAction:
        "Reduce your next move to the real size of the channel. If he asked nothing, do not turn a cold reply into another forced conversation.",
      bridge:
        "Haz Que Vuelva™ organizes when to reply, when to close lightly, and which signal must appear before advancing.",
      cta: "HELP ME PROTECT THE CHANNEL THAT STILL EXISTS",
    },
    green: {
      publicName: "Real opening",
      prediagnosisHeadline:
        "There is observable openness. Your greatest risk is accelerating and asking for a definition too soon.",
      headline:
        "There is an observable opening. Your biggest risk is trying to turn it into an immediate definition.",
      diagnosis: [
        "He initiates, stays engaged, or shows curiosity. That is better than simple politeness, but it is not repair yet.",
        "If you ask for certainty or solve the entire past before consistency exists, curiosity can become new pressure.",
      ],
      firstAction:
        "Reply proportionally, do not open the whole history at once, and watch whether he sustains the next move without being pushed.",
      bridge:
        "Haz Que Vuelva™ includes the R0–R4 scale to distinguish openness, investment, and repair.",
      cta: "SHOW ME HOW TO MOVE FORWARD WITHOUT RUSHING HIM",
    },
    third_person: {
      publicName: "Third-person interference",
      prediagnosisHeadline:
        "The other woman is taking up more room in your decisions than his actual signals.",
      headline:
        "Another woman may exist. The greatest risk is letting her control every decision you make.",
      diagnosis: [
        "When you compare, investigate, or provoke jealousy, you stop looking at what matters: what he offers directly, clearly, and consistently.",
        "Your route separates what is confirmed, what you are inferring, and what he does with you without triangulation.",
      ],
      firstAction:
        "Do not investigate, compete, or post an indirect message. Write down confirmed facts and remove any action driven by comparison.",
      bridge:
        "Haz Que Vuelva™ gives you the initial decision without teaching surveillance, attacks, or interference in another relationship.",
      cta: "HELP ME STOP COMPETING AND RECOVER MY POSITION",
    },
    logistics: {
      publicName: "Functional contact",
      prediagnosisHeadline:
        "He replies because he has to. Now separate functional contact from emotional interest.",
      headline:
        "He replies because something must be resolved. That does not yet tell you whether an emotional door exists.",
      diagnosis: [
        "Children, work, money, or property keep the channel open. Mixing logistics with reconnection makes every reply look like hope.",
        "An emotional signal must appear outside obligation and hold without being forced.",
      ],
      firstAction:
        "Separate the functional message from the emotional one. Resolve what is necessary without adding nostalgia, demands, or a relationship talk.",
      bridge:
        "Haz Que Vuelva™ shows you how to preserve the functional channel and which signal must exist before testing emotional openness.",
      cta: "HELP ME SEPARATE OBLIGATION FROM REAL INTEREST",
    },
    red: {
      publicName: "Strategic pause",
      prediagnosisHeadline:
        "Your case requires a no-contact route: regain control first, then evaluate any signal.",
      headline:
        "Your next step is not to insist. It is to stop worsening the channel and regain control.",
      diagnosis: [
        "If he asked you not to contact him or there is a legal restriction, any future possibility begins by respecting that boundary. Using another number, account, or intermediary only adds pressure.",
        "On this route, the protocol is not for sending messages. It is for stopping the impulse, organizing the facts, and making clear decisions over the next seven days.",
      ],
      firstAction:
        "Do not contact him or look for another channel. Record what triggered the last impulse and begin a deliberate seven-day pause.",
      bridge:
        "Haz Que Vuelva™ can guide that pause: it shows you what not to do, how to organize the signals, and when a boundary means you must keep your distance.",
      cta: "I WANT A ROUTE TO STOP IMPROVISING",
    },
  },
  pitch: {
    headline:
      "Your diagnosis showed the problem. Haz Que Vuelva™ guides your next 7 days so you stop improvising.",
    paragraphs: [
      "Your result has already given you a first decision. The hard part begins when anxiety tries to change the plan, send “just one more thing,” or treat every signal as an opening.",
      "The Affective Memory Window™ is not a brain diagnosis. It is a model for recognizing when an interaction reinforces pressure and when it can create a lighter, more coherent experience.",
    ],
    bullets: [
      "what to stop today",
      "how to read the actual state of the channel",
      "when to write, reply, or wait",
      "which message to use when openness exists",
      "how to measure reciprocity without confusing nostalgia with repair",
      "how to move forward without begging, chasing, or losing dignity",
    ],
    method: [
      "R · Regulate the impulse that makes you act from anxiety",
      "E · Examine your route and the state of the channel",
      "G · Generate one small, real proof of change",
      "R · Reopen only when a legitimate door exists",
      "E · Enter in tune with the reciprocity he demonstrates",
      "S · Synchronize closeness without rushing",
      "A · Agree on repair or make a clear decision",
    ],
    items: [
      {
        title: "Diagnosis and six routes",
        description: "with a first action matched to your scenario.",
      },
      {
        title: "Complete 7-day protocol",
        description: "one decision at a time, without improvising.",
      },
      {
        title: "Write / reply / wait decision tree",
        description: "so the decision happens before opening the chat.",
      },
      {
        title: "V.I.V.E. Map and R0–R4 Scale",
        description: "to measure viability and observable reciprocity.",
      },
      {
        title: "Essential messages and final decision sheet",
        description: "only when your route allows contact.",
      },
    ],
    proofTitle: "This is what exists inside the protocol",
    caption:
      "You are not buying a promise about what he will do. You are buying clarity about what you do starting today.",
    price: "Immediate access for US$7 · one-time payment",
    guarantee:
      "7-day guarantee. If the protocol does not help you understand your route and execute the first decision, request a refund within the checkout period.",
    cta: "GET ACCESS TO HAZ QUE VUELVA™ NOW",
    microcopy:
      "Access after approval. Checkout add-ons are optional; the main method is complete.",
  },
  faq: {
    title: "Before you decide",
    items: [
      {
        question: "Does this guarantee he will come back?",
        answer:
          "No. It organizes what you control: stop the mistake, read the channel, choose the next action, and measure reciprocity.",
      },
      {
        question: "Does it work if I am blocked?",
        answer:
          "It helps you know what not to do and recognize a legitimate opening. It does not teach bypassing a block or finding another channel.",
      },
      {
        question: "What if there is another woman?",
        answer:
          "The protocol gives the initial decision. The deeper third-person playbook is an optional checkout add-on.",
      },
      {
        question: "Will I receive ready-made messages?",
        answer:
          "It includes essential messages when your route allows contact. No phrase is presented as a guarantee.",
      },
      {
        question: "When do I get access?",
        answer: "After payment approval, through the checkout channel.",
      },
      {
        question: "How much does it cost?",
        answer: "US$7, one-time, with a seven-day guarantee.",
      },
    ],
    cta: "START MY 7-DAY PROTOCOL",
  },
  summaries: {
    state: {
      cold_contact: "you still talk, but he is cold or replies less and less",
      blocked: "he blocked you, stopped replying, or disappeared",
      third_person: "there is another woman or a concrete fear of replacement",
      intermittent: "he moves closer and disappears again",
      green_contact: "he initiates and sustains some conversations",
      logistics: "contact exists only for necessary matters",
      explicit_stop: "there is an explicit boundary, fear, or legal restriction",
    },
    distance: {
      lt_7d: "less than 7 days",
      "1_4w": "between 1 and 4 weeks",
      "1_3m": "between 1 and 3 months",
      gt_3m: "more than 3 months",
    },
    action: {
      long_message: "a long message or request for another chance",
      insistence: "insistence or pressure for an answer",
      blind_silence: "no contact used as a universal rule",
      jealousy: "indirect posts, jealousy, or monitoring",
      intimacy: "intimacy followed by renewed distance",
      pause: "no action yet",
    },
    pain: {
      silence: "silence and emptiness",
      replacement: "the fear of being replaced",
      guilt: "guilt about the last opening",
      second_option: "the fear of remaining a second option",
    },
  },
  ui: {
    answerHint: "Choose the option closest to your situation.",
    changeLanguage: "Change language",
    loadingProofLabel: "Real protocol page",
    restart: "Retake the diagnosis",
    skip: "Continue",
  },
};
