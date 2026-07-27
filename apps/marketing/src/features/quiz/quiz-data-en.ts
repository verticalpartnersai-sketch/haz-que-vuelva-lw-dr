import type {
  QuizCopy,
  QuizQuestion,
} from "@/features/quiz/quiz-contracts";
import { resultCopyEn } from "@/features/quiz/quiz-results-en";

const questions: readonly QuizQuestion[] = [
  {
    id: "current_state",
    title: "To prepare a route for your case, where do things stand today?",
    microcopy:
      "Your answers are used only to organize this diagnosis. You do not need to upload conversations or share your name.",
    options: [
      {
        label: "We still talk, but he is cold, distant, or replies less and less",
        value: "cold_contact",
      },
      {
        label: "He blocked me, stopped replying, or disappeared completely",
        value: "blocked",
      },
      {
        label: "There is another woman, he went back to an ex, or I feel replaced",
        value: "third_person",
      },
      {
        label: "He reaches out, gets close, and then disappears again",
        value: "intermittent",
      },
      {
        label: "He has started conversations again and keeps them going without pressure",
        value: "green_contact",
      },
      {
        label: "We only talk about children, work, money, or something we must resolve",
        value: "logistics",
      },
      {
        label: "He clearly asked me not to contact him, I am afraid, or there is a legal restriction",
        value: "explicit_stop",
      },
    ],
  },
  {
    context:
      "We have identified the state of the channel. Now let’s measure how long the distance has been building.",
    id: "distance_time",
    title: "How long has the relationship been cold, broken, or interrupted?",
    options: [
      {
        label: "Less than 7 days",
        transition:
          "You are still in the phase where an impulsive reaction can change the tone of everything.",
        value: "lt_7d",
      },
      {
        label: "Between 1 and 4 weeks",
        transition:
          "Distance has already created a new routine. What you do now must break the pattern, not repeat it.",
        value: "1_4w",
      },
      {
        label: "Between 1 and 3 months",
        transition:
          "At this point, repeating the same strategy only confirms the image he is already avoiding.",
        value: "1_3m",
      },
      {
        label: "More than 3 months",
        transition:
          "After months, the key is not sending more. It is creating a different experience and watching for real openness.",
        value: "gt_3m",
      },
    ],
  },
  {
    id: "last_action",
    title: "Since he pulled away, which action is closest to what you did?",
    options: [
      {
        label: "I sent a long message, explained everything, or asked for another chance",
        value: "long_message",
      },
      {
        label: "I insisted, demanded an answer, or texted again after no reply",
        value: "insistence",
      },
      {
        label: "I disappeared because I was told no contact always works",
        value: "blind_silence",
      },
      {
        label: "I posted indirect messages, tried to make him jealous, or acted over it",
        value: "jealousy",
      },
      {
        label: "We met or became intimate, but he turned cold again afterward",
        value: "intimacy",
      },
      {
        label: "I have not done anything yet; I came here before another mistake",
        value: "pause",
      },
    ].map((option) => ({
      ...option,
      transition:
        "That action does not define your story, but it may be feeding the Rejection Loop™ that keeps the channel cold.",
    })),
  },
  {
    id: "dominant_pain",
    title: "What is hurting you most right now?",
    variant: "cards",
    options: [
      {
        emoji: "◌",
        label: "Opening WhatsApp, seeing his silence, and feeling the emptiness",
        transition:
          "Silence hurts because it gives your mind room to invent a different answer every hour.",
        value: "silence",
      },
      {
        emoji: "◇",
        label: "Imagining him happy with someone else while I wait for a sign",
        transition:
          "Comparison makes her every move seem more important than what he actually does with you.",
        value: "replacement",
      },
      {
        emoji: "↯",
        label: "Thinking my anxiety destroyed my last chance",
        transition:
          "Guilt pushes you to over-explain. Each new explanation can sound like more pressure.",
        value: "guilt",
      },
      {
        emoji: "↺",
        label: "Having him return when lonely but never truly choose me",
        transition:
          "Returning out of nostalgia or loneliness does not mean he is willing to repair the relationship.",
        value: "second_option",
      },
    ],
  },
  {
    id: "dominant_fear",
    title: "If you keep acting the same way, what are you most afraid will happen?",
    options: [
      {
        emoji: "😔",
        label: "He will forget me and our history will stop meaning anything",
        value: "forgotten",
      },
      {
        emoji: "💔",
        label: "He will fall for someone else and I will be too late",
        value: "other_woman",
      },
      {
        emoji: "⏳",
        label: "The last window for contact will close completely",
        value: "closed_window",
      },
      {
        emoji: "🔁",
        label: "He will return for one night, disappear again, and keep me in the cycle",
        value: "repeat_cycle",
      },
    ].map((option) => ({
      ...option,
      transition:
        "We have what we need. Now we will compare the channel, time, and your last action.",
    })),
  },
];

export const quizCopyEn: QuizCopy = {
  intro: {
    eyebrow: "PRIVATE RECONNECTION DIAGNOSIS · 2 MINUTES",
    headline:
      "Discover what is pushing him away… and how to open a new Affective Memory Window™.",
    subheadline:
      "Answer five questions. See what is closing the door, which mistake to stop today, and the first decision in your 7-day protocol.",
    cta: "Discover what is happening",
    privacy:
      "Your answers are used only for this diagnosis. We do not ask for your name, screenshots, or conversations.",
  },
  questions,
  loaderOne: {
    title: "Analyzing your case and the real state of contact…",
    states: [
      "Reading the state of the channel…",
      "Identifying the active Rejection Loop™…",
      "Calculating your Emotional Distance Index…",
      "Preparing the first decision for your case…",
    ],
    captions: [
      "Your case does not get a universal rule. It gets a route.",
      "The decision comes before the message.",
      "Seven days, one action at a time.",
    ],
  },
  prediagnosis: {
    alert: "INITIAL ANALYSIS COMPLETE!",
    scoreTitle: "Emotional Distance Index",
    scoreSubtitle:
      "Based on the channel, time, and pressure created by your last action.",
    loop: [
      "silence or an ambiguous signal",
      "anxiety",
      "message, pressure, jealousy, or a dramatic disappearance",
      "more distance",
      "more urgency to fix it",
      "repeat",
    ],
    bodyAfterLoop: [
      "The way out does not begin with a magic phrase. It begins when you change the recent experience he associates with you inside the Affective Memory Window™.",
      "This model does not read his mind. It helps you avoid repeating the pressure he is already trying to escape.",
    ],
    needs: [
      "what to stop today",
      "whether your channel allows writing, replying, or waiting",
      "which signal to watch before the next step",
      "when to move and when to do nothing",
    ],
    cta: "SHOW ME HOW TO REOPEN MY WINDOW",
    microcopy:
      "Your full result is being prepared. First, I need to know which change matters most to you.",
  },
  desire: {
    title:
      "Besides knowing what to stop today, do you want to use the next 7 days to stop reinforcing pressure and rebuild curiosity and openness?",
    options: [
      {
        label: "Yes. I want him to feel my absence and want to move closer",
        value: "desire_missing",
      },
      {
        label: "Yes. I want a direct route so anxiety does not cost me the opening",
        value: "desire_control",
      },
    ],
  },
  commitment: {
    title:
      "Your protocol may tell you to write, reply, or wait. Will you follow the route for 7 days, even when anxiety wants something else?",
    options: [
      {
        label: "Yes. I want to stop improvising and follow one decision a day",
        value: "commit_route",
      },
      {
        label: "Yes. But it must be simple, direct, and useful starting today",
        value: "commit_simple",
      },
    ],
  },
  loaderTwo: {
    title: "Creating your initial 7-day route…",
    states: [
      "Separating real signals from interpretations…",
      "Defining what you need to stop today…",
      "Matching your route to the R.E.G.R.E.S.A. 7D™ Method…",
      "Preparing your first 24-hour decision…",
    ],
    captions: [
      "Day 1 · Regulate: stop acting to relieve anxiety.",
      "Day 2 · Examine: identify the route and state of the channel.",
      "Day 3 · Generate: create one small, observable change.",
      "Days 4–7: reopen only with a channel, measure reciprocity, and decide.",
    ],
  },
  painImpulses: {
    silence: {
      sentence: "his silence and the emptiness it left",
      impulse: "look for an answer that relieves uncertainty right now",
    },
    replacement: {
      sentence: "the fear of being replaced",
      impulse: "compare, monitor, or try to provoke a reaction",
    },
    guilt: {
      sentence: "guilt about what you did",
      impulse: "over-explain and try to fix everything in one message",
    },
    second_option: {
      sentence: "the fear of remaining his second option",
      impulse: "accept a return without requiring consistency",
    },
  },
  ...resultCopyEn,
};
