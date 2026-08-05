import { DecisionActions } from "@/features/upsells/decision-actions";
import type { OfferBlock } from "@/features/upsells/offer-copy";
import { OfferInline } from "@/features/upsells/offer-inline";

type OfferCopyBlocksProps = {
  blocks: OfferBlock[];
  allBlocks: OfferBlock[];
  acceptHref: string | null;
  declineHref: string;
  firstDecisionId: string;
};

function bodyRaw(block: OfferBlock) {
  if (block.type === "heading" || block.type === "price") {
    return block.raw.replace(/^#{1,6}\s+/, "");
  }
  if (block.type === "strong_paragraph") return block.raw.slice(2, -2);
  if (block.type === "emphasis") return block.raw.slice(1, -1);
  if (block.type === "inline_note") return block.raw.slice(1, -1);
  return block.raw;
}

function Heading({ block }: { block: OfferBlock }) {
  const content = <OfferInline raw={bodyRaw(block)} />;
  if (block.index === 0) return <h1>{content}</h1>;
  if ((block.level ?? 1) > 1) return <h3>{content}</h3>;
  return <h2>{content}</h2>;
}

export function OfferCopyBlocks({
  blocks,
  allBlocks,
  acceptHref,
  declineHref,
  firstDecisionId,
}: OfferCopyBlocksProps) {
  return blocks.map((block) => {
    if (block.type === "negative_cta") return null;

    if (block.type === "heading") return <Heading block={block} key={block.id} />;

    if (block.type === "price") {
      return (
        <p className="pp-copy-price" key={block.id}>
          <OfferInline raw={bodyRaw(block)} />
        </p>
      );
    }

    if (block.type === "positive_cta") {
      const negative = allBlocks[block.index + 1];
      if (negative?.type !== "negative_cta") {
        throw new Error("Canonical CTA pair is broken at " + block.id);
      }
      const decisionId = "decision-" + block.id;
      return (
        <DecisionActions
          acceptHref={acceptHref}
          decisionId={decisionId === firstDecisionId ? firstDecisionId : undefined}
          declineHref={declineHref}
          key={block.id}
          negativeLabel={negative.text}
          positiveLabel={block.text}
        />
      );
    }

    if (block.type === "list") {
      return (
        <ul className="pp-copy-list" key={block.id}>
          {block.raw.split("\n").map((item, index) => (
            <li key={block.id + "-item-" + String(index)}>
              <OfferInline raw={item.replace(/^-\s+/, "")} />
            </li>
          ))}
        </ul>
      );
    }

    if (block.type === "legal_links") {
      return null;
    }

    if (block.type === "postscript") {
      return (
        <aside className="pp-postscript" key={block.id}>
          <OfferInline raw={block.raw} />
        </aside>
      );
    }

    if (block.type === "strong_paragraph") {
      return (
        <p className="pp-strong" key={block.id}>
          <strong><OfferInline raw={bodyRaw(block)} /></strong>
        </p>
      );
    }

    if (block.type === "emphasis") {
      return (
        <p className="pp-emphasis" key={block.id}>
          <em><OfferInline raw={bodyRaw(block)} /></em>
        </p>
      );
    }

    if (block.type === "inline_note") {
      return (
        <p className="pp-inline-note" key={block.id}>
          <OfferInline raw={bodyRaw(block)} />
        </p>
      );
    }

    return (
      <p key={block.id}>
        <OfferInline raw={block.raw} />
      </p>
    );
  });
}
