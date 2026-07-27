import type { Metadata } from "next";

import { AiPage } from "@/features/ai/ai-page";

export const metadata: Metadata = { title: "Asistente de relaciones" };

export default function Page() {
  return <AiPage />;
}
