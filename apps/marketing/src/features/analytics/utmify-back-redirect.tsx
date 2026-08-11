"use client";

import { useEffect } from "react";

const historyMarker = "__hazQueVuelvaBackRedirect";

function resolvedRedirectUrl(target: string) {
  const destination = new URL(target, window.location.origin);

  if (destination.protocol !== "http:" && destination.protocol !== "https:") {
    return null;
  }

  const currentQuery = new URLSearchParams(window.location.search);
  currentQuery.forEach((value, key) => {
    if (!destination.searchParams.has(key)) {
      destination.searchParams.set(key, value);
    }
  });

  return destination.toString();
}

export function UtmifyBackRedirect({ target }: { target?: string }) {
  useEffect(() => {
    if (!target?.trim()) return;

    let redirectUrl: string | null = null;

    try {
      redirectUrl = resolvedRedirectUrl(target.trim());
    } catch {
      return;
    }

    if (!redirectUrl) return;

    const currentState = history.state as Record<string, unknown> | null;
    if (!currentState?.[historyMarker]) {
      const markedState = { ...currentState, [historyMarker]: true };
      history.pushState(markedState, "", window.location.href);
      history.pushState(markedState, "", window.location.href);
      history.pushState(markedState, "", window.location.href);
    }

    const redirectOnBack = () => {
      window.location.assign(redirectUrl);
    };

    window.addEventListener("popstate", redirectOnBack);
    return () => window.removeEventListener("popstate", redirectOnBack);
  }, [target]);

  return null;
}
