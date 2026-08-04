"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";
import type {
  ProofPreviewStory,
  ProofPreviewStoryId,
} from "@/features/quiz/quiz-contracts";

const rotationInterval = 6500;

const testimonialAssets: Record<ProofPreviewStoryId, string> = {
  camila: "/images/quiz/proof-preview/camila-chat-v3.webp",
  sofia: "/images/quiz/proof-preview/sofia-chat-v3.webp",
  valentina: "/images/quiz/proof-preview/valentina-chat-v3.webp",
};

export function QuizTestimonialCarousel({
  stories,
}: {
  stories: readonly ProofPreviewStory[];
}) {
  const { l } = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const rotationPaused = manualPaused || hoverPaused;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      if (query.matches) setManualPaused(true);
    };
    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (rotationPaused || stories.length < 2) return;
    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % stories.length);
    }, rotationInterval);
    return () => window.clearInterval(interval);
  }, [rotationPaused, stories.length]);

  function move(step: number) {
    setActiveIndex(
      (index) => (index + step + stories.length) % stories.length,
    );
  }

  if (stories.length === 0) return null;

  return (
    <section
      aria-label={l(
        "Historias de reconexión",
        "Histórias de reconexão",
        "Reconnection stories",
      )}
      aria-roledescription={l("carrusel", "carrossel", "carousel")}
      className="quiz-testimonial-carousel"
      onFocusCapture={() => setManualPaused(true)}
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      role="region"
    >
      <div className="quiz-testimonial-carousel__controls">
        <button
          aria-label={l(
            "Mostrar testimonio anterior",
            "Mostrar depoimento anterior",
            "Show previous testimonial",
          )}
          onClick={() => move(-1)}
          type="button"
        >
          <Icon name="arrowLeft" weight="bold" />
        </button>
        <button
          aria-label={
            manualPaused
              ? l(
                  "Iniciar rotación automática",
                  "Iniciar rotação automática",
                  "Start automatic rotation",
                )
              : l(
                  "Pausar rotación automática",
                  "Pausar rotação automática",
                  "Pause automatic rotation",
                )
          }
          className="quiz-testimonial-carousel__toggle"
          onClick={() => setManualPaused((paused) => !paused)}
          type="button"
        >
          {manualPaused
            ? l("Reproducir", "Reproduzir", "Play")
            : l("Pausar", "Pausar", "Pause")}
        </button>
        <span aria-hidden="true">
          {activeIndex + 1} / {stories.length}
        </span>
        <button
          aria-label={l(
            "Mostrar siguiente testimonio",
            "Mostrar próximo depoimento",
            "Show next testimonial",
          )}
          onClick={() => move(1)}
          type="button"
        >
          <Icon name="arrowRight" weight="bold" />
        </button>
      </div>

      <div
        aria-live={rotationPaused ? "polite" : "off"}
        className="quiz-testimonial-carousel__viewport"
      >
        <div
          className="quiz-testimonial-carousel__track"
          style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}
        >
          {stories.map((story, index) => (
            <article
              aria-hidden={index !== activeIndex}
              aria-label={`${index + 1} / ${stories.length}`}
              aria-roledescription={l("diapositiva", "slide", "slide")}
              className="quiz-testimonial-carousel__slide"
              key={story.id}
              role="group"
            >
              <p className="quiz-testimonial-carousel__intro">{story.intro}</p>
              <figure>
                <Image
                  alt={story.imageAlt}
                  height={880}
                  loading="lazy"
                  sizes="(max-width: 639px) calc(100vw - 52px), 390px"
                  src={testimonialAssets[story.id]}
                  width={672}
                />
                <figcaption className="sr-only">
                  {story.messages.join(" ")}
                </figcaption>
              </figure>
              <p className="quiz-testimonial-carousel__outro">
                {story.conclusion}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
