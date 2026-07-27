import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  isLocale,
  localeCookieName,
} from "@/features/i18n/locale-config";
import { QuizPage } from "@/features/quiz/quiz-page";

export async function generateMetadata(): Promise<Metadata> {
  const requestedLocale = (await cookies()).get(localeCookieName)?.value;
  const locale = isLocale(requestedLocale) ? requestedLocale : "es";

  return {
    title: {
      es: "Diagnóstico privado de reconexión",
      pt: "Diagnóstico privado de reconexão",
      en: "Private reconnection diagnosis",
    }[locale],
    description: {
      es: "Responde cinco preguntas y descubre tu Índice de Distancia Emocional, la ruta de tu canal y la primera decisión para los próximos 7 días.",
      pt: "Responda cinco perguntas e descubra seu Índice de Distância Emocional, a rota do seu canal e a primeira decisão para os próximos 7 dias.",
      en: "Answer five questions to discover your Emotional Distance Index, the state of your channel, and the first decision for the next 7 days.",
    }[locale],
  };
}

export default function Page() {
  return <QuizPage />;
}
