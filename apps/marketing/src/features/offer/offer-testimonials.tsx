import Image from "next/image";

import type { OfferCopy } from "./offer-contracts";

const testimonialPrints = {
  anonymous: "/images/quiz/sales-proof/universal-chat.webp",
  camila: "/images/quiz/proof-preview/camila-chat-v3.webp",
  sofia: "/images/quiz/proof-preview/sofia-chat-v3.webp",
  valentina: "/images/quiz/proof-preview/valentina-chat-v3.webp",
} as const;

export function OfferTestimonials({ copy }: { copy: OfferCopy }) {
  const alt = copy.locale === "pt"
    ? "Print de conversa de uma mulher após usar o método"
    : "Captura de conversación de una mujer después de usar el método";

  return (
    <section className="offer-v2-testimonials">
      <header>
        <h2>{copy.locale === "pt" ? "Nossos clientes nos amam" : "Nuestros clientes nos aman"}</h2>
      </header>
      <div className="offer-v2-testimonials__grid">
        {copy.testimonials.map((testimonial) => (
          <figure key={testimonial.id}>
            <Image
              alt={`${testimonial.name}: ${alt}`}
              height={1275}
              loading="lazy"
              sizes="(max-width: 699px) calc(100vw - 34px), 420px"
              src={testimonialPrints[testimonial.id]}
              width={900}
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
