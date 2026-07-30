import type {
  QuizCopy,
  QuizQuestion,
} from "@/features/quiz/quiz-contracts";
import { brandCopyEn } from "@/features/quiz/quiz-brand-copy-en";
import { previewCopyEn } from "@/features/quiz/quiz-preview-copy-en";
import { resultCopyEn } from "@/features/quiz/quiz-results-en";

const questions: readonly QuizQuestion[] = [
  {
    id: "current_state",
    title: "Before you text him again, I need to know what is happening between you today.",
    microcopy:
      "Answer based on what he does, not what you wish he still felt.",
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
      "I know how much access you still have to him. Now I need to measure how long he has been learning to live with your absence.",
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
        "The relief of acting may last seconds. The distance that action reinforces may last days—that is the Rejection Loop™.",
    })),
  },
  {
    id: "dominant_pain",
    title: "What is hurting you most right now?",
    variant: "cards",
    options: [
      {
        image: "/images/quiz/pain/pain-silence-v1.webp",
        label: "Opening WhatsApp, seeing his silence, and feeling the emptiness",
        transition:
          "Silence hurts because it gives your mind room to invent a different answer every hour.",
        value: "silence",
      },
      {
        image: "/images/quiz/pain/pain-replacement-v1.webp",
        label: "Imagining him happy with someone else while I wait for a sign",
        transition:
          "Comparison makes her every move seem more important than what he actually does with you.",
        value: "replacement",
      },
      {
        image: "/images/quiz/pain/pain-guilt-v1.webp",
        label: "Thinking my anxiety destroyed my last chance",
        transition:
          "Guilt pushes you to over-explain. Each new explanation can sound like more pressure.",
        value: "guilt",
      },
      {
        image: "/images/quiz/pain/pain-second-option-v1.webp",
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
  brand: brandCopyEn,
  preview: previewCopyEn,
  intro: {
    eyebrow: "EVERY DAY YOU IMPROVISE, HE LEARNS TO MISS YOU LESS",
    headline: "He has not forgotten you yet.",
    headlineAccent:
      "But your next mistake can teach him to live without you.",
    subheadline:
      "Answer five questions and discover what is killing his desire, what you must stop today, and how to get back on his mind before distance turns into indifference.",
    cta: "DISCOVER WHAT TO DO BEFORE I LOSE HIM",
    privacy:
      "Your answers are used only for this diagnosis. We do not ask for your name, screenshots, or conversations.",
  },
  questions,
  loaderOne: {
    title: "Finding what is pushing him away and how much of your connection is still alive…",
    socialProof: {
      lead: "More than 5,732 women",
      middle: "replaced anxiety with a clear path to",
      highlight: "regain control and reopen the connection",
    },
    states: [
      "Measuring how much emotional access you still have…",
      "Identifying the mistake reinforcing his distance…",
      "Calculating the risk of losing the window that still exists…",
      "Preparing what you must do before opening the chat again…",
    ],
    captions: [
      "You do not need another phrase. You need to stop triggering his resistance.",
      "Your next move can awaken curiosity or confirm his distance.",
      "Over seven days, each decision must move you toward a different response.",
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
      "He does not need to forget your whole story to pull away. He only needs to associate your presence with pressure, anxiety, or a conversation he never wants to relive.",
      "If you repeat the same pattern, you may give him the final confirmation he needs to close the door. Haz Que Vuelva™ changes the experience he expects from you before distance becomes indifference, so your absence can create curiosity, tension, and a desire to move closer again.",
    ],
    needs: [
      "what to stop today",
      "whether your channel allows writing, replying, or waiting",
      "which signal to watch before the next step",
      "when to move and when to do nothing",
    ],
    cta: "I WANT TO STOP THIS WINDOW FROM CLOSING",
    microcopy:
      "We have identified what is working against you. Now I need to know what you want him to feel.",
  },
  desire: {
    title:
      "Besides discovering the mistake that is pushing him away, do you want to use the next 7 days to make your absence weigh on him, reignite desire, and make his urge to return increasingly difficult to ignore?",
    options: [
      {
        label:
          "Yes. I want him to miss me and reach out again because he genuinely wants to",
        value: "desire_missing",
      },
      {
        label:
          "Yes. I want a simple path to awaken that without having to chase him",
        value: "desire_control",
      },
    ],
  },
  commitment: {
    title:
      "If one impulse can close the last window that still exists, will you follow your route for 7 days before anxiety makes your next move?",
    options: [
      {
        label: "Yes. I want to stop chasing answers and make every move work in my favor",
        value: "commit_route",
      },
      {
        label: "Yes. I want to know exactly what to do when anxiety tries to sabotage me",
        value: "commit_simple",
      },
    ],
  },
  loaderTwo: {
    title: "Building the next 7 days so you stop pushing him farther away…",
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
