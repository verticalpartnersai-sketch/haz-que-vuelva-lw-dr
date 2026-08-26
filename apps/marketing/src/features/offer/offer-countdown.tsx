"use client";

import { useEffect, useState } from "react";

import { formatOfferCountdown } from "./offer-timer";

export function OfferCountdown({
  initialSeconds,
}: {
  initialSeconds: number;
}) {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <time dateTime={`PT${remaining}S`}>{formatOfferCountdown(remaining)}</time>;
}
