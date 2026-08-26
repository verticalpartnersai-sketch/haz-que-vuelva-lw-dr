"use client";

import { useState } from "react";

import type { OfferCopy } from "./offer-contracts";

export function OfferFaq({ copy }: { copy: OfferCopy }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="offer-v2-faq">
      <h2>FAQ</h2>
      <div>
        {copy.faq.map((item, index) => {
          const expanded = open === index;
          const panelId = `offer-faq-${index}`;
          return (
            <article className={expanded ? "is-open" : undefined} key={item.question}>
              <h3>
                <button
                  aria-controls={panelId}
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : index)}
                  type="button"
                >
                  <span>{item.question}</span>
                  <i aria-hidden="true">⌄</i>
                </button>
              </h3>
              <div hidden={!expanded} id={panelId}><p>{item.answer}</p></div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
