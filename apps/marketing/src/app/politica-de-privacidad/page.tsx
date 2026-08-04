import type { Metadata } from "next";

import { LegalPublicPage } from "@/features/legal/legal-public-page";

export const metadata: Metadata = {
  title: "Política de privacidad",
};

export default function PrivacyPolicyPage() {
  return <LegalPublicPage kind="privacy" />;
}
