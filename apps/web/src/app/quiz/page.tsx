import { redirect } from "next/navigation";

import { environment } from "@/server/config/environment";

const productionMarketingUrl = "https://hazquevuelva.site";
const developmentMarketingUrl = "http://127.0.0.1:3001";

export default function QuizRedirectPage() {
  const configuredUrl = environment().MARKETING_APP_URL;
  const marketingUrl =
    configuredUrl ??
    (process.env.NODE_ENV === "development"
      ? developmentMarketingUrl
      : productionMarketingUrl);

  redirect(new URL("/quiz", marketingUrl).toString());
}
