import { MobileDecisionBar } from "@/features/upsells/mobile-decision-bar";
import { firstCtaId, getOfferCopy, splitOfferSections, type OfferRoute } from "@/features/upsells/offer-copy";
import { OfferCopyBlocks } from "@/features/upsells/offer-copy-blocks";
import { offerPageConfig, sectionTone } from "@/features/upsells/offer-page-config";
import {
  PostPurchaseFooter,
  PostPurchaseHeader,
} from "@/features/upsells/postpurchase-chrome";
import { hasOfferSectionVisual, OfferSectionVisual } from "@/features/upsells/offer-section-visual";

type PostPurchaseOfferPageProps = {
  acceptHref: string | null;
  declineHref: string;
  route: OfferRoute;
};

function Up1HeroPrice() {
  return (
    <aside className="pp-hero-price" aria-label="Precio de Reconquista 30">
      <span>Añade Reconquista 30™ ahora</span>
      <strong>US$6,90</strong>
      <small>Pago único · sin mensualidad</small>
    </aside>
  );
}

export function PostPurchaseOfferPage({
  acceptHref,
  declineHref,
  route,
}: PostPurchaseOfferPageProps) {
  const copy = getOfferCopy(route);
  const config = offerPageConfig[route];
  const sections = splitOfferSections(copy, config.anchors);
  const firstPositive = copy.blocks.find((block) => block.type === "positive_cta");
  const firstNegative = firstPositive ? copy.blocks[firstPositive.index + 1] : undefined;
  const decisionId = firstCtaId(copy);
  const heroLeadBlockCount = route === "up1" ? 4 : route === "up2" ? 10 : null;

  if (!firstPositive || firstNegative?.type !== "negative_cta") {
    throw new Error(route + " canonical CTA pair is unavailable");
  }

  return (
    <main
      className={
        "pp-page pp-page--" + config.product + " pp-page--" + config.variant
      }
      data-copy-hash={copy.sourceHash}
      data-offer-route={route}
    >
      <a className="pp-skip-link" href="#contenido-principal">
        Ir al contenido principal
      </a>
      <PostPurchaseHeader product={config.product} />

      <div id="contenido-principal">
        {sections.map((section) => (
          <section
            className={
              "pp-section pp-section--" + sectionTone(section.anchor) +
              " pp-section--" + String(section.index + 1)
            }
            data-section-anchor={section.anchor}
            key={section.key}
          >
            {heroLeadBlockCount && section.index === 0 ? (
              <div className="pp-section__layout pp-hero-split">
                <div className="pp-hero-split__lead">
                  <div className="pp-section__copy">
                    <OfferCopyBlocks
                      acceptHref={acceptHref}
                      allBlocks={copy.blocks}
                      blocks={section.blocks.slice(0, heroLeadBlockCount)}
                      declineHref={declineHref}
                      firstDecisionId={decisionId}
                    />
                    {route === "up1" ? <Up1HeroPrice /> : null}
                  </div>
                  <div className="pp-section__enhancement">
                    <OfferSectionVisual anchor={section.anchor} route={route} />
                  </div>
                </div>
                <div className="pp-section__copy pp-hero-split__story">
                  <OfferCopyBlocks
                    acceptHref={acceptHref}
                    allBlocks={copy.blocks}
                    blocks={section.blocks.slice(heroLeadBlockCount)}
                    declineHref={declineHref}
                    firstDecisionId={decisionId}
                  />
                </div>
              </div>
            ) : (
              <div
                className={
                  "pp-section__layout" +
                  (hasOfferSectionVisual(route, section.anchor)
                    ? " pp-section__layout--visual"
                    : "")
                }
              >
                <div className="pp-section__copy">
                  <OfferCopyBlocks
                    acceptHref={acceptHref}
                    allBlocks={copy.blocks}
                    blocks={section.blocks}
                    declineHref={declineHref}
                    firstDecisionId={decisionId}
                  />
                </div>
                <div className="pp-section__enhancement">
                  <OfferSectionVisual anchor={section.anchor} route={route} />
                </div>
              </div>
            )}
          </section>
        ))}
      </div>

      <PostPurchaseFooter />

      <MobileDecisionBar
        acceptHref={acceptHref}
        declineHref={declineHref}
        firstDecisionId={decisionId}
        negativeLabel={firstNegative.text}
        positiveLabel={firstPositive.text}
      />
    </main>
  );
}
