import type { QuizCopy } from "@/features/quiz/quiz-contracts";

type ResultCopy = Pick<
  QuizCopy,
  "demonstration" | "faq" | "pitch" | "result" | "routes" | "summaries" | "ui"
>;

export const resultCopyEn: ResultCopy = {
  demonstration: {
    headline:
      "The problem is not that he feels nothing. It is that every anxious move can make staying away from you feel like relief.",
    subheadline:
      "As that relief repeats, he learns to resist your presence instead of missing it. That is what you must interrupt before opening the chat again.",
    cases: [
      {
        eyebrow: "WHEN YOU SEEK RELIEF",
        description:
          "A long message, another explanation, or asking for one more chance may calm you for minutes. To him, it can confirm that returning means reliving the same pressure.",
        decision:
          "Result: distance feels like relief, and he learns to protect himself from your next contact.",
        proof: "routes",
      },
      {
        eyebrow: "WHEN YOU TRY TO PROVOKE HIM",
        description:
          "Disappearing without a strategy, posting indirect messages, or provoking jealousy does not create desire by itself. If he sees the maneuver, he only sees anxiety disguised as control.",
        decision:
          "Result: his attention stays on defending himself, not wondering why you suddenly feel different.",
        proof: "scale",
      },
      {
        eyebrow: "WHEN YOU CHANGE THE PATTERN",
        description:
          "When you stop reacting the way he expects and make a move proportional to the channel, pressure drops. Your presence stops feeling like a repetition of the past.",
        decision:
          "Result: resistance loses strength and curiosity, contrast, and a desire to move closer can begin to return.",
        proof: "decision",
      },
    ],
    dynamicLabels: [
      "What still exists between you",
      "The move that can destroy it",
      "The first step to change the pattern",
    ],
    cta: "I WANT MY NEXT MOVE TO WORK IN MY FAVOR",
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
        "You do not need to send another explanation. You need less pressure before silence turns into firm rejection.",
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
      costOfInaction:
        "If you return to the chat without a rule, every shortcut, explanation, or attempt through another channel can turn temporary distance into firm rejection.",
      offerHeadline:
        "Your first win is not a reply. It is stopping the creation of new reasons for him to keep the door closed.",
      offerLead:
        "On the Closed Door route, Haz Que Vuelva™ organizes a deliberate pause and shows which signals must exist before any reopening.",
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
      costOfInaction:
        "If you treat every short reply as an opportunity, you will put pressure on a fragile channel that he cannot yet sustain.",
      offerHeadline:
        "You still have access to him. Now you must stop anxiety from turning that opening into proof that staying away from you feels better.",
      offerLead:
        "Haz Que Vuelva organizes intensity, timing, and every next decision so he stops meeting the same pressure and starts noticing a version of you he did not expect.",
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
      costOfInaction:
        "If you demand definition before consistency exists, you can turn curiosity into pressure and a real opening into new distance.",
      offerHeadline:
        "You do not need to make him return. You need to stop urgency from destroying the opening he has already started to show.",
      offerLead:
        "On the Real Opening route, Haz Que Vuelva™ shows how to reply proportionally, measure investment, and move forward without rushing the relationship.",
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
      costOfInaction:
        "While you monitor, compare, or try to beat the other woman, she occupies your attention and directs a strategy that should belong to you.",
      offerHeadline:
        "Stop competing for a position that only his behavior can confirm.",
      offerLead:
        "On the Third-Person Interference route, the protocol separates facts from fear and returns your attention to the only evidence that matters: direct reciprocity.",
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
      costOfInaction:
        "If you use children, work, or money to create closeness, every required reply will feed hope without proving interest.",
      offerHeadline:
        "Required contact is not emotional openness. Mixing the two keeps you trapped in signals that were never promises.",
      offerLead:
        "On the Functional Contact route, Haz Que Vuelva™ separates logistics from reconnection and defines the minimum signal before any emotional move.",
      cta: "HELP ME SEPARATE OBLIGATION FROM REAL INTEREST",
    },
    red: {
      publicName: "Strategic pause",
      prediagnosisHeadline:
        "Your situation requires a no-contact route: regain control first, then evaluate any signal.",
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
      costOfInaction:
        "Using another number, account, or intermediary does not reopen the channel. It adds pressure, destroys trust, and can worsen a restriction that must be respected.",
      offerHeadline:
        "On this route, winning is not sending the right message. It is regaining control before the impulse decides for you.",
      offerLead:
        "On the Strategic Pause route, Haz Que Vuelva™ works as a protocol for containment, fact reading, and decisions without contact.",
      cta: "I WANT A ROUTE TO STOP IMPROVISING",
    },
  },
  pitch: {
    headline:
      "Your diagnosis showed the problem. Haz Que Vuelva™ guides your next 7 days so you stop improvising.",
    paragraphs: [
      "Your result has already given you a first decision. The dangerous part begins when your brain seeks quick relief and tries to renegotiate the plan with “just one more message.”",
      "Haz Que Vuelva™ interrupts that loop before the chat: identify the channel state, execute one proportional decision, and move only when reciprocity is observable.",
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
    proofTitle: "Everything waiting for you inside your protocol",
    caption:
      "You are not buying a promise about what he will do. You are buying clarity about what you do starting today.",
    price: "Immediate access for US$7",
    guarantee:
      "7-day guarantee. If the protocol does not help you understand your route and execute the first decision, request a refund within the checkout period.",
    cta: "GET ACCESS TO HAZ QUE VUELVA™ NOW",
    microcopy: "",
  },
  faq: {
    title: "Before you decide",
    items: [
      {
        question: "What if I feel I need to text him today?",
        answer:
          "That impulse is exactly when you need a route most. Before opening the chat, the protocol helps you separate emotional urgency from a real opening and choose the move that does not add more pressure.",
      },
      {
        question: "Does this work if he blocked me?",
        answer:
          "Yes. On that route, the first goal is not finding another account or number. It is stopping the block from becoming more pursuit, regaining control, and learning which signals must exist before a legitimate reopening.",
      },
      {
        question: "What if there is another woman?",
        answer:
          "Your route separates facts, suspicion, and direct reciprocity. That stops you from competing with a story fear may be completing and brings your attention back to what can guide a decision: how he behaves with you.",
      },
      {
        question: "Does it work if we still talk but he is cold?",
        answer:
          "That is one of the protocol's core scenarios. You learn to match the real intensity of the channel, end conversations without dragging them out, and observe whether he invests again without being pushed.",
      },
      {
        question: "What if we only talk about children, work, or money?",
        answer:
          "The protocol helps separate required contact from emotional interest. You handle what is necessary without using logistics as a reason to seek closeness and learn which signal must appear outside obligation.",
      },
      {
        question: "Will I receive ready-to-send messages?",
        answer:
          "You receive essential messages, but only for moments when your route allows contact. The power is not in a magic sentence. It is using the right sentence, at the right intensity, at the right time.",
      },
      {
        question: "Do I have to disappear for 30 days?",
        answer:
          "No. Haz Que Vuelva does not use no contact as a universal rule. Some routes require a pause; others require a proportional reply. The diagnosis exists so you do not apply the same advice to different situations.",
      },
      {
        question: "What if I already made many mistakes and asked for another chance?",
        answer:
          "You cannot erase what happened, but you can stop confirming it. The next seven days interrupt the pattern he already expects and build a different experience before you try to move closer again.",
      },
      {
        question: "Does the protocol guarantee he will come back?",
        answer:
          "No one can guarantee another person's decision. The protocol organizes what you control: stop the mistake, read the channel, choose the next action, and measure reciprocity without getting lost in promises.",
      },
      {
        question: "How much time do I need each day?",
        answer:
          "The route is built around brief, executable decisions. You do not need hours of study. Open the day's material, understand the decision, and apply it without negotiating with anxiety.",
      },
      {
        question: "Can I follow the protocol on my phone?",
        answer:
          "Yes. The material is digital and can be viewed on a phone, tablet, or computer, so your route is close when the impulse to improvise appears.",
      },
      {
        question: "What exactly do I receive?",
        answer:
          "You receive the six-route diagnosis, the complete seven-day protocol, the write or reply or wait decision tree, the V.I.V.E. map, the R0–R4 scale, essential messages, and the final decision sheet.",
      },
      {
        question: "When do I get access?",
        answer:
          "Access is released after payment approval through the channel shown at checkout. Nothing is shipped and there is no delivery wait.",
      },
      {
        question: "Is the payment monthly?",
        answer:
          "No. Access costs US$7 and does not create a recurring subscription.",
      },
      {
        question: "How does the 7-day guarantee work?",
        answer:
          "Enter, discover your route, and apply the first decisions. If within seven days you feel the protocol did not give you the clarity you expected, you can request a refund within the guarantee period.",
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
