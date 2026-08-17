export type MetaEventKind = "custom" | "standard";

export type MetaEvent = {
  kind: MetaEventKind;
  name: string;
  parameters: Record<string, boolean | number | string>;
};

export type MetaPixelFunction = (...args: unknown[]) => unknown;

export const FRONT_PRICE_USD = 8.49;

type AnalyticsPayload = Record<
  string,
  boolean | number | string | undefined
>;

const contentByPath: Record<
  string,
  { content_category: string; content_name: string }
> = {
  "/quiz": {
    content_category: "front",
    content_name: "Haz Que Vuelva Quiz",
  },
  "/up1": {
    content_category: "upsell",
    content_name: "Reconquista 30",
  },
  "/d1": {
    content_category: "downsell",
    content_name: "Reconquista 30",
  },
  "/up2": {
    content_category: "upsell",
    content_name: "Vuelve IA",
  },
  "/d2": {
    content_category: "downsell",
    content_name: "Vuelve IA",
  },
};

const quizStartParameterKeys = [
  "ad_id",
  "adset_id",
  "creative_id",
  "campaign_id",
  "fbclid",
  "utm_source",
  "utm_campaign",
  "utm_medium",
  "utm_content",
  "utm_term",
  "utm_adset",
  "utm_ad",
] as const;

const quizCompleteParameterKeys = [
  "route",
  "distance_band",
  "distance_index",
  "reconquista30_eligible",
] as const;

function definedParameters(payload: AnalyticsPayload) {
  return Object.fromEntries(
    Object.entries(payload).filter(
      (entry): entry is [string, boolean | number | string] =>
        entry[1] !== undefined,
    ),
  );
}

function allowlistedParameters(
  payload: AnalyticsPayload,
  keys: readonly string[],
) {
  return definedParameters(
    Object.fromEntries(keys.map((key) => [key, payload[key]])),
  );
}

export function isMetaPixelId(value: string | undefined): value is string {
  return Boolean(value?.trim().match(/^\d{5,30}$/));
}

export function metaPixelBootstrap(pixelId: string) {
  if (!isMetaPixelId(pixelId)) return "";
  const id = pixelId.trim();
  return `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');`;
}

export function metaEventForAnalytics(
  event: string,
  payload: AnalyticsPayload,
): MetaEvent | null {
  if (event === "quiz_start") {
    return {
      kind: "custom",
      name: "QuizStart",
      parameters: allowlistedParameters(payload, quizStartParameterKeys),
    };
  }

  if (event === "quiz_result_view") {
    return {
      kind: "custom",
      name: "QuizComplete",
      parameters: allowlistedParameters(payload, quizCompleteParameterKeys),
    };
  }

  if (event === "checkout_start") {
    const { cta_position, route } = payload;
    return {
      kind: "custom",
      name: "FrontCheckoutClick",
      parameters: definedParameters({
        content_name: "Haz Que Vuelva",
        currency: "USD",
        cta_position,
        route,
        value: FRONT_PRICE_USD,
      }),
    };
  }

  return null;
}

export function dispatchMetaEvent(
  pixelId: string,
  event: MetaEvent,
  fbq: MetaPixelFunction,
) {
  const command = event.kind === "standard" ? "trackSingle" : "trackSingleCustom";
  fbq(command, pixelId.trim(), event.name, event.parameters);
}

export function metaPageEvents(pathname: string): MetaEvent[] {
  const events: MetaEvent[] = [
    { kind: "standard", name: "PageView", parameters: {} },
  ];
  const content = contentByPath[pathname];
  if (content) {
    events.push({
      kind: "standard",
      name: "ViewContent",
      parameters: content,
    });
  }
  return events;
}
