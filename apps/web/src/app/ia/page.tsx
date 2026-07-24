import type { Metadata } from "next";

import { AiPage } from "@/features/ai/ai-page";

export const metadata: Metadata = { title: "IA" };

export default function Page() {
  return <AiPage />;
}
