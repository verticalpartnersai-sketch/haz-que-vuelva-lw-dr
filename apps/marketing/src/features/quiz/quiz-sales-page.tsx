"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";
import type {
  QuizAnswers,
  QuizRoute,
} from "@/features/quiz/quiz-contracts";
import { resolvedLastAction } from "@/features/quiz/quiz-engine";
import { quizContentFor } from "@/features/quiz/quiz-i18n";
import { QuizLogo } from "@/features/quiz/quiz-intro-question";
import { productProofAssets } from "@/features/quiz/quiz-proof";
import {
  quizSalesCopyFor,
  type SalesValueItem,
} from "@/features/quiz/quiz-sales-copy";

type CheckoutHandler = (position: string) => void;

const routeProofAssets: Record<QuizRoute, string> = {
  gray: "/images/quiz/sales-proof/route-gray-chat.webp",
  green: "/images/quiz/sales-proof/route-green-chat.webp",
  logistics: "/images/quiz/sales-proof/route-logistics-chat.webp",
  red: "/images/quiz/sales-proof/route-red-chat.webp",
  third_person: "/images/quiz/sales-proof/route-third-person-chat.webp",
  yellow: "/images/quiz/sales-proof/route-yellow-chat.webp",
};

const valueImages = {
  calendar: productProofAssets.calendar,
  cover: productProofAssets.cover,
  decision: productProofAssets.decision,
  routes: productProofAssets.routes,
  scale: productProofAssets.scale,
} as const;

function SalesCta({
  buttonRef,
  label,
  onCheckout,
  position,
}: {
  buttonRef?: RefObject<HTMLButtonElement | null>;
  label: string;
  onCheckout: CheckoutHandler;
  position: string;
}) {
  return (
    <button
      className="quiz-sales__cta"
      data-sales-cta=""
      onClick={() => onCheckout(position)}
      ref={buttonRef}
      type="button"
    >
      <span>{label}</span>
      <Icon name="arrowRight" weight="bold" />
    </button>
  );
}

function SalesProof({
  alt,
  intro,
  outro,
  src,
}: {
  alt: string;
  intro: string;
  outro: string;
  src: string;
}) {
  return (
    <article className="quiz-sales-proof">
      <p>{intro}</p>
      <figure>
        <Image
          alt={alt}
          height={880}
          loading="lazy"
          sizes="(max-width: 639px) calc(100vw - 40px), 390px"
          src={src}
          width={672}
        />
      </figure>
      <p>{outro}</p>
    </article>
  );
}

function ValueItem({
  item,
}: {
  item: SalesValueItem;
}) {
  return (
    <article className="quiz-sales-value__item">
      <div className="quiz-sales-value__media">
        <Image
          alt=""
          height={1275}
          loading="lazy"
          sizes="(max-width: 639px) 44vw, 190px"
          src={valueImages[item.image]}
          width={900}
        />
      </div>
      <div>
        <span className="quiz-sales-value__kind">
          <i>
            <Icon name="check" weight="bold" />
          </i>
          {item.kind}
        </span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <strong>{item.value}</strong>
      </div>
    </article>
  );
}

function StickySalesCta({
  label,
  onCheckout,
  position,
}: {
  label: string;
  onCheckout: CheckoutHandler;
  position: string;
}) {
  return (
    <aside className="quiz-sales-sticky">
      <button onClick={() => onCheckout(position)} type="button">
        {label}
        <Icon name="arrowRight" weight="bold" />
      </button>
    </aside>
  );
}

function SalesFaq({
  items,
  title,
}: {
  items: readonly {
    answer: string;
    question: string;
  }[];
  title: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="quiz-sales-faq">
      <h2>{title}</h2>
      <div>
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `sales-faq-panel-${index}`;

          return (
            <article className={isOpen ? "is-open" : undefined} key={item.question}>
              <h3>
                <button
                  aria-controls={panelId}
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  type="button"
                >
                  <span>{item.question}</span>
                  <Icon name="arrowDown" weight="bold" />
                </button>
              </h3>
              <div hidden={!isOpen} id={panelId}>
                <p>{item.answer}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function QuizSalesPage({
  answers,
  checkoutStatus,
  headingRef,
  onCheckout,
  route,
}: {
  answers: QuizAnswers;
  checkoutStatus: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onCheckout: CheckoutHandler;
  route: QuizRoute;
}) {
  const { locale } = useLocale();
  const quizCopy = quizContentFor(locale);
  const sales = quizSalesCopyFor(locale);
  const routeCopy = sales.routes[route];
  const action = resolvedLastAction(answers);
  const state = quizCopy.summaries.state[
    answers.current_state ?? "cold_contact"
  ];
  const distance = quizCopy.summaries.distance[
    answers.distance_time ?? "lt_7d"
  ];
  const actionSummary = quizCopy.summaries.action[action];
  const commitment = answers.commitment ?? "commit_route";
  const heroCtaRef = useRef<HTMLButtonElement>(null);
  const offerRef = useRef<HTMLElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [offerReached, setOfferReached] = useState(false);

  useEffect(() => {
    function updateStickyCta() {
      const heroCta = heroCtaRef.current;
      const offer = offerRef.current;
      if (!heroCta || !offer) return;

      const naturalCtaVisible = Array.from(
        document.querySelectorAll<HTMLElement>("[data-sales-cta]"),
      ).some((element) => {
        const rect = element.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight;
      });
      const heroPassed = heroCta.getBoundingClientRect().bottom < 0;
      const hasReachedOffer =
        offer.getBoundingClientRect().top < window.innerHeight * 0.62;

      setStickyVisible(heroPassed && !naturalCtaVisible);
      setOfferReached(hasReachedOffer);
    }

    updateStickyCta();
    window.addEventListener("resize", updateStickyCta);
    window.addEventListener("scroll", updateStickyCta, { passive: true });
    return () => {
      window.removeEventListener("resize", updateStickyCta);
      window.removeEventListener("scroll", updateStickyCta);
    };
  }, []);

  return (
    <>
      <main className="quiz-sales quiz-stage" id="quiz-content">
        <QuizLogo compact />

        <header className="quiz-sales-hero">
          <span className="quiz-sales__status">
            <Icon name="check" weight="bold" />
            {sales.badge}
          </span>
          <span className="quiz-sales__route">{routeCopy.label}</span>
          <h1 ref={headingRef} tabIndex={-1}>
            {routeCopy.headline}
          </h1>
          <p>{sales.heroSubheadline}</p>
          <SalesCta
            buttonRef={heroCtaRef}
            label={sales.cta}
            onCheckout={onCheckout}
            position="hero"
          />
          <small>{sales.ctaMicrocopy}</small>
        </header>

        <section className="quiz-sales-prose quiz-sales-mirror">
          <span className="quiz-sales__badge">{sales.routeBadge}</span>
          <h2>{sales.mirror.heading}</h2>
          <p>
            {sales.mirror.opening} <strong>{state}</strong>,{" "}
            {sales.mirror.distance} <strong>{distance}</strong>{" "}
            {sales.mirror.action} <strong>{actionSummary}</strong>.
          </p>
          <p>{routeCopy.diagnosis}</p>
          <p>{routeCopy.consequence}</p>
          <p>{sales.mirror.conclusion}</p>
        </section>

        <section className="quiz-sales-prose quiz-sales-mechanism">
          <h2>{sales.mechanism.heading}</h2>
          <p>{sales.mechanism.intro}</p>
          <ol aria-label={sales.mechanism.heading}>
            {sales.mechanism.sequence.map((step) => (
              <li key={step}>
                <span>{step}</span>
                <Icon name="arrowDown" weight="bold" />
              </li>
            ))}
          </ol>
          <p className="quiz-sales-mechanism__claim">{sales.mechanism.claim}</p>
          <p>{sales.mechanism.closing}</p>
        </section>

        <section className="quiz-sales-timeline">
          <header>
            <h2>{sales.timeline.heading}</h2>
            <p>{sales.timeline.body}</p>
          </header>
          <ol>
            {sales.timeline.items.map((item) => (
              <li key={item.day}>
                <span>{item.day}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <SalesCta
            label={sales.cta}
            onCheckout={onCheckout}
            position="timeline"
          />
        </section>

        <section className="quiz-sales-social">
          <h2>{sales.proof.heading}</h2>
          <p className="quiz-sales-social__count">{sales.proof.count}</p>
          <SalesProof
            alt={routeCopy.proofAlt}
            intro={routeCopy.proofIntro}
            outro={routeCopy.proofOutro}
            src={routeProofAssets[route]}
          />
        </section>

        <section className="quiz-sales-reveal">
          <QuizLogo compact />
          <h2>{sales.reveal.heading}</h2>
          <p>{sales.reveal.body}</p>
          <Image
            alt={sales.reveal.heading}
            className="quiz-sales-reveal__mockup"
            height={960}
            loading="lazy"
            sizes="(max-width: 639px) calc(100vw - 24px), 760px"
            src={productProofAssets.bundleMockup}
            width={1440}
          />
        </section>

        <section className="quiz-sales-value">
          <header>
            <h2>{sales.value.heading}</h2>
            <p>{sales.value.body}</p>
          </header>
          <div>
            {sales.value.items.map((item) => (
              <ValueItem item={item} key={item.title} />
            ))}
          </div>
          <strong className="quiz-sales-value__total">{sales.value.total}</strong>
          <SalesCta
            label={sales.cta}
            onCheckout={onCheckout}
            position="value_stack"
          />
        </section>

        <section className="quiz-sales-prose quiz-sales-cost">
          <h2>{sales.cost.heading}</h2>
          <p>{sales.cost.body}</p>
        </section>

        <section className="quiz-sales-social quiz-sales-social--universal">
          <SalesProof
            alt={sales.proof.universalAlt}
            intro={sales.proof.universalIntro}
            outro={sales.proof.universalOutro}
            src="/images/quiz/sales-proof/universal-chat.webp"
          />
        </section>

        <section className="quiz-sales-offer" ref={offerRef}>
          <header>
            <span>{sales.offer.eyebrow}</span>
            <h2>{sales.offer.heading}</h2>
            <p>{sales.offer.body}</p>
            <p className="quiz-sales-offer__commitment">
              {quizCopy.preview.pitch.commitmentLead[commitment]}
            </p>
          </header>

          <article className="quiz-sales-checkout">
            <QuizLogo compact />
            <h3>{sales.checkout.heading}</h3>
            <ul>
              {sales.checkout.summary.map((item) => (
                <li key={item}>
                  <Icon name="check" weight="bold" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="quiz-sales-checkout__compare">
              <s>{sales.checkout.compareAt}</s>
            </p>
            <strong>{sales.checkout.price}</strong>
            <SalesCta
              label={sales.cta}
              onCheckout={onCheckout}
              position="offer"
            />
            <small>{sales.checkout.access}</small>
            <p aria-live="polite" className="quiz-checkout-status">
              {checkoutStatus}
            </p>
          </article>
        </section>

        <section className="quiz-sales-guarantee">
          <Image
            alt=""
            height={640}
            loading="lazy"
            sizes="180px"
            src={productProofAssets.guaranteeSeal}
            width={640}
          />
          <h2>{sales.guarantee.heading}</h2>
          <p>{sales.guarantee.body}</p>
        </section>

        <SalesFaq items={sales.faq.items} title={sales.faq.title} />

        <section className="quiz-sales-closing">
          <h2>{sales.closing.heading}</h2>
          <p>{sales.closing.body}</p>
          <SalesCta
            label={sales.cta}
            onCheckout={onCheckout}
            position="after_faq"
          />
        </section>
      </main>

      {stickyVisible ? (
        <StickySalesCta
          label={
            offerReached
              ? sales.stickyAfterOffer
              : sales.stickyBeforeOffer
          }
          onCheckout={onCheckout}
          position={offerReached ? "sticky_offer" : "sticky_education"}
        />
      ) : null}
    </>
  );
}
