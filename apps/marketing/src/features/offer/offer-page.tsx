"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { FRONT_PRICE_USD } from "@/features/analytics/meta-pixel-events";
import type { FunnelLocale } from "@/features/i18n/funnel-locale";
import { QuizLogo } from "@/features/quiz/quiz-intro-question";
import { defaultQuizSession, readQuizSession } from "@/features/quiz/quiz-flow-runtime";
import { track, utmParameters } from "@/features/quiz/quiz-runtime";
import { offerBonusMockups } from "./offer-assets";
import { buildOfferCheckoutUrl } from "./offer-checkout";
import { OfferCountdown } from "./offer-countdown";
import { offerCopyFor } from "./offer-copy";
import { OfferFaq } from "./offer-faq";
import { OfferPricingCard } from "./offer-pricing-card";
import { OfferTestimonials } from "./offer-testimonials";

export function OfferPage({ locale }: { locale: FunnelLocale }) {
  const copy = offerCopyFor(locale);
  const [session, setSession] = useState(defaultQuizSession);
  const [bonusesEnabled, setBonusesEnabled] = useState(true);
  const [checkoutStatus, setCheckoutStatus] = useState("");
  const pricingRef = useRef<HTMLElement>(null);
  const viewTrackedRef = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      let nextSession = defaultQuizSession();
      try {
        nextSession = readQuizSession(window.sessionStorage) ?? nextSession;
      } catch {
        // Direct access and unavailable storage both use the deterministic fallback.
      }
      setSession(nextSession);
      if (!viewTrackedRef.current) {
        viewTrackedRef.current = true;
        track("offer_view", {
          quiz_version: "hqv_quiz_v2",
          score_band: nextSession.scoreBand,
        });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function scrollToPricing() {
    const target = pricingRef.current;
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ behavior: "smooth", top });
  }

  function checkout(ctaPosition: string) {
    try {
      const destination = buildOfferCheckoutUrl({
        attribution: utmParameters(),
        ctaPosition,
        scoreBand: session.scoreBand,
      });
      track("offer_cta_click", {
        cta_position: ctaPosition,
        quiz_version: "hqv_quiz_v2",
        score_band: session.scoreBand,
      });
      track("checkout_start", {
        cta_position: ctaPosition,
        currency: "USD",
        price: FRONT_PRICE_USD,
        quiz_version: "hqv_quiz_v2",
        score_band: session.scoreBand,
      });
      const checkoutWindow = window.open(destination.toString(), "_blank", "noopener,noreferrer");
      if (checkoutWindow) checkoutWindow.opener = null;
    } catch {
      setCheckoutStatus(locale === "pt"
        ? "Não foi possível abrir o checkout. Recarregue a página e tente novamente."
        : "No fue posible abrir el checkout. Recarga la página e inténtalo otra vez.");
    }
  }

  return (
    <div className="offer-v2-public">
      <aside className="offer-v2-timer">
        <div><span>{copy.timerLabel}</span><OfferCountdown initialSeconds={copy.timerSeconds} /></div>
        <button onClick={scrollToPricing} type="button">{locale === "pt" ? "GARANTIR MEU PLANO" : "GARANTIZAR MI PLAN"}</button>
      </aside>

      <header className="offer-v2-header"><QuizLogo compact /></header>

      <main>
        <section className="offer-v2-transformation">
          <article>
            <div className="offer-v2-transformation__media">
              <Image alt="" fill priority sizes="(max-width: 720px) calc(100vw - 32px), 760px" src="/images/quiz/v2/current-state.webp" />
            </div>
            <div className="offer-v2-transformation__copy"><span>{copy.transformation.current.label}</span><h2>{copy.transformation.current.state}</h2><p>{copy.transformation.current.body}</p></div>
          </article>
          <article>
            <div className="offer-v2-transformation__media">
              <Image alt="" fill priority sizes="(max-width: 720px) calc(100vw - 32px), 760px" src="/images/quiz/v2/reconnection-goal.webp" />
            </div>
            <div className="offer-v2-transformation__copy"><span>{copy.transformation.goal.label}</span><h2>{copy.transformation.goal.state}</h2><p>{copy.transformation.goal.body}</p></div>
          </article>
        </section>

        <section className="offer-v2-probability">
          <div className="offer-v2-probability__heading">
            <span aria-hidden="true">🔥</span>
            <div>
              <small>{copy.probability.label}</small>
              <strong>{session.score}%</strong>
            </div>
          </div>
          <div
            aria-label={`${copy.probability.label}: ${session.score}%`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={session.score}
            className="offer-v2-probability__bar"
            role="progressbar"
          >
            <span style={{ width: `${session.score}%` }} />
          </div>
          <b>{copy.probability.level}</b>
        </section>

        <section className="offer-v2-urgency">
          <span aria-hidden="true">⚠️</span>
          <div>
            <h2>{copy.urgency.alert.replace("⚠️ ", "")}</h2>
            <p>{copy.urgency.note}</p>
          </div>
        </section>

        <section className="offer-v2-product">
          <span>{copy.product.preheadline}</span>
          <Image alt="Haz Que Vuelva" height={392} src="/images/brand/haz-que-vuelva-logo-heart-primary-v1.webp" width={1451} />
          <h1>{copy.product.headline}</h1>
          <div className="offer-v2-product__claims">
            {copy.product.body.map((paragraph) => (
              <p key={paragraph}>
                <span aria-hidden="true">✅</span>
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className={`offer-v2-bonuses${bonusesEnabled ? " is-enabled" : ""}`}>
          <button aria-pressed={bonusesEnabled} onClick={() => setBonusesEnabled((value) => !value)} type="button">
            <span>💌 {copy.bonusToggle}</span><i aria-hidden="true"><b /></i>
          </button>
          <h2>{copy.bonusHeading}</h2>
          <p>{copy.bonusFormat}</p>
          <div>
            {copy.bonuses.map((bonus, index) => (
              <article key={bonus.id}>
                <Image
                  alt={bonus.name}
                  className="offer-v2-bonus-mockup"
                  height={1536}
                  loading="eager"
                  sizes="(max-width: 759px) calc(100vw - 40px), 260px"
                  src={offerBonusMockups[bonus.id]}
                  unoptimized
                  width={1024}
                />
                <span>#{index + 1}</span>
                <h3>{bonus.name}</h3>
              </article>
            ))}
          </div>
        </section>

        <OfferPricingCard copy={copy} onCheckout={checkout} position="offer_primary" sectionRef={pricingRef} />

        <section className="offer-v2-rating">
          <h2>{copy.rating.heading}</h2>
          <strong>{copy.rating.value}</strong>
          <span>★★★★★</span>
          <p>{copy.rating.badge}</p>
          <button className="offer-v2-cta" onClick={() => checkout("rating")} type="button">{copy.cta}</button>
        </section>

        <section className="offer-v2-benefits">
          <h2>{locale === "pt" ? "O que você vai receber?" : "¿Qué vas a recibir?"}</h2>
          <ul>
            {copy.benefits.map((benefit) => (
              <li key={benefit}>
                <span aria-hidden="true">✅</span>
                {benefit}
              </li>
            ))}
          </ul>
        </section>

        <section className="offer-v2-statistics">
          <h2>{copy.statisticsHeading}</h2>
          <div>{copy.statistics.map((stat) => <article key={stat.value}><strong>{stat.value}</strong><p>{stat.label}</p></article>)}</div>
        </section>

        <OfferTestimonials copy={copy} />
        <OfferPricingCard copy={copy} onCheckout={checkout} position="offer_repeat" />

        <section className="offer-v2-guarantee">
          <Image alt="" height={640} src="/images/quiz/offer/guarantee-seal-transparent-v2.webp" width={640} />
          <h2>{copy.guarantee.heading}</h2>
          <p>{copy.guarantee.body}</p>
          <strong>{copy.guarantee.seal}</strong>
          <button className="offer-v2-cta" onClick={() => checkout("guarantee")} type="button">{locale === "pt" ? "GARANTIR MEU PLANO" : "GARANTIZAR MI PLAN"}</button>
        </section>

        <OfferFaq copy={copy} />
        <p aria-live="polite" className="offer-v2-status">{checkoutStatus}</p>
      </main>

      <footer className="offer-v2-footer">
        <QuizLogo compact />
        <nav aria-label={locale === "pt" ? "Informações legais" : "Información legal"}>
          <Link href="/politica-de-privacidad">{locale === "pt" ? "Política de privacidade" : "Política de privacidad"}</Link>
          <Link href="/terminos-de-uso">{locale === "pt" ? "Termos de uso" : "Términos de uso"}</Link>
        </nav>
        <p>{locale === "pt"
          ? "HAZ QUE VUELVA é um material educativo. Não garante que uma pessoa específica retorne nem substitui orientação psicológica, médica ou jurídica."
          : "HAZ QUE VUELVA es un material educativo. No garantiza que una persona específica regrese ni sustituye orientación psicológica, médica o legal."}</p>
        <small>© {new Date().getFullYear()} HAZ QUE VUELVA™.</small>
      </footer>
    </div>
  );
}
