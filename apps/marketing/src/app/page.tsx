import { redirect } from "next/navigation";

import { buildQuizRedirect } from "@/features/analytics/attribution-redirect";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  redirect(buildQuizRedirect(await searchParams));
}
