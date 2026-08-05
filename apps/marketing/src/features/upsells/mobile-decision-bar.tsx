"use client";

import { useEffect, useState } from "react";

import { DecisionActions } from "@/features/upsells/decision-actions";

type MobileDecisionBarProps = {
  acceptHref: string | null;
  declineHref: string;
  firstDecisionId: string;
  positiveLabel: string;
  negativeLabel: string;
};

export function MobileDecisionBar({
  acceptHref,
  declineHref,
  firstDecisionId,
  positiveLabel,
  negativeLabel,
}: MobileDecisionBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const firstDecision = document.getElementById(firstDecisionId);
    const legalFooter = document.querySelector<HTMLElement>("[data-legal-footer]");
    if (!firstDecision || !legalFooter) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const decisionPassed = firstDecision.getBoundingClientRect().bottom < 0;
      const footerNear = legalFooter.getBoundingClientRect().top < window.innerHeight + 24;
      setVisible(decisionPassed && !footerNear);
    };
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [firstDecisionId]);

  return (
    <aside
      aria-hidden={!visible}
      className={"pp-mobile-bar" + (visible ? " pp-mobile-bar--visible" : "")}
      inert={!visible}
    >
      <DecisionActions
        acceptHref={acceptHref}
        compact
        declineHref={declineHref}
        negativeLabel={negativeLabel}
        positiveLabel={positiveLabel}
      />
    </aside>
  );
}
