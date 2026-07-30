type SearchValue = string | string[] | undefined;

export type OfferSearchParams = Record<string, SearchValue>;

const MAX_QUERY_VALUE_LENGTH = 512;

function firstValue(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

export function withPreservedQuery(
  destination: string,
  searchParams: OfferSearchParams,
) {
  const url = new URL(destination, "https://hazquevuelva.site");

  for (const [key, rawValue] of Object.entries(searchParams)) {
    const value = firstValue(rawValue);
    if (!value || value.length > MAX_QUERY_VALUE_LENGTH) continue;
    if (!url.searchParams.has(key)) url.searchParams.set(key, value);
  }

  return url.origin === "https://hazquevuelva.site"
    ? `${url.pathname}${url.search}${url.hash}`
    : url.toString();
}

export function configuredOfferUrl(
  environmentValue: string | undefined,
  searchParams: OfferSearchParams,
) {
  if (!environmentValue) return null;

  try {
    return withPreservedQuery(environmentValue, searchParams);
  } catch {
    return null;
  }
}
