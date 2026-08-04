import type { Metadata } from "next";

import { LegalPublicPage } from "@/features/legal/legal-public-page";

export const metadata: Metadata = {
  title: "Términos de uso",
};

export default function TermsOfUsePage() {
  return <LegalPublicPage kind="terms" />;
}
