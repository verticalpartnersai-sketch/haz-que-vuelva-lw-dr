"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import {
  dispatchMetaEvent,
  isMetaPixelId,
  metaEventForAnalytics,
  metaPageEvents,
  type MetaPixelFunction,
} from "@/features/analytics/meta-pixel-events";

type AnalyticsEventDetail = {
  event?: unknown;
} & Record<string, unknown>;

declare global {
  interface Window {
    fbq?: MetaPixelFunction;
  }
}

function analyticsDetail(event: Event) {
  if (!(event instanceof CustomEvent)) return null;
  const detail = event.detail as AnalyticsEventDetail | null;
  if (!detail || typeof detail.event !== "string") return null;

  const { event: eventName, ...payload } = detail;
  return {
    eventName,
    payload: Object.fromEntries(
      Object.entries(payload).filter(
        (entry): entry is [string, boolean | number | string] =>
          typeof entry[1] === "boolean" ||
          typeof entry[1] === "number" ||
          typeof entry[1] === "string",
      ),
    ),
  };
}

export function MetaPixelBridge({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!isMetaPixelId(pixelId) || !window.fbq) return;
    metaPageEvents(pathname).forEach((event) =>
      dispatchMetaEvent(pixelId, event, window.fbq as MetaPixelFunction),
    );
  }, [pathname, pixelId]);

  useEffect(() => {
    if (!isMetaPixelId(pixelId)) return;

    const forwardAnalyticsEvent = (event: Event) => {
      if (!window.fbq) return;
      const detail = analyticsDetail(event);
      if (!detail) return;
      const metaEvent = metaEventForAnalytics(detail.eventName, detail.payload);
      if (metaEvent) dispatchMetaEvent(pixelId, metaEvent, window.fbq);
    };

    window.addEventListener("hazquevuelva:analytics", forwardAnalyticsEvent);
    return () =>
      window.removeEventListener("hazquevuelva:analytics", forwardAnalyticsEvent);
  }, [pixelId]);

  return null;
}
