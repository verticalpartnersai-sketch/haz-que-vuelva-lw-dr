const attributionParameterKeys = [
  "ad_id",
  "adset_id",
  "campaign_id",
  "creative_id",
  "fbclid",
  "utm_ad",
  "utm_adset",
  "utm_campaign",
  "utm_content",
  "utm_medium",
  "utm_source",
  "utm_term",
] as const;

type RedirectSearchParameters = Record<
  string,
  string | string[] | undefined
>;

export function buildQuizRedirect(searchParams: RedirectSearchParameters) {
  const approved = new URLSearchParams();

  attributionParameterKeys.forEach((key) => {
    const value = searchParams[key];
    if (typeof value === "string" && value) approved.set(key, value);
  });

  const query = approved.toString();
  return query ? `/quiz?${query}` : "/quiz";
}
