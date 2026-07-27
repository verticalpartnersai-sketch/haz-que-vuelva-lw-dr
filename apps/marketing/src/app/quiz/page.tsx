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
      es: "Diagnóstico de 60 segundos",
      pt: "Diagnóstico de 60 segundos",
      en: "60-second diagnosis",
    }[locale],
    description: {
      es: "Responde cinco preguntas y descubre qué error debes cortar hoy y qué ruta seguir durante los próximos 7 días.",
      pt: "Responda a cinco perguntas e descubra qual erro interromper hoje e qual rota seguir durante os próximos 7 dias.",
      en: "Answer five questions and discover which mistake to stop today and which route to follow for the next 7 days.",
    }[locale],
  };
}

export default function Page() {
  return <QuizPage />;
}
