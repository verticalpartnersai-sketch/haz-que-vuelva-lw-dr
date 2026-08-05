import copyArtifact from "@/features/upsells/generated/offer-copy.generated.json";

export type OfferRoute = "up1" | "d1" | "up2" | "d2";

export type OfferBlock = {
  id: string;
  index: number;
  raw: string;
  type:
    | "emphasis"
    | "heading"
    | "inline_note"
    | "legal_links"
    | "list"
    | "negative_cta"
    | "paragraph"
    | "positive_cta"
    | "postscript"
    | "price"
    | "strong_paragraph";
  text: string;
  level?: number;
  items?: string[];
};

export type OfferCopy = {
  route: OfferRoute;
  source: string;
  sourceHash: string;
  raw: string;
  blocks: OfferBlock[];
};

const offers = copyArtifact as Record<OfferRoute, OfferCopy>;

export function getOfferCopy(route: OfferRoute) {
  return offers[route];
}

export function firstCtaId(copy: OfferCopy) {
  const block = copy.blocks.find((candidate) => candidate.type === "positive_cta");
  if (!block) throw new Error("Offer copy has no primary CTA: " + copy.route);
  return "decision-" + block.id;
}

export function splitOfferSections(copy: OfferCopy, anchors: readonly string[]) {
  const starts = [0];
  let previous = 0;

  for (const anchor of anchors) {
    const index = copy.blocks.findIndex(
      (block) => block.index > previous && block.type === "heading" && block.text === anchor,
    );
    if (index < 0) throw new Error(copy.route + " section anchor is missing: " + anchor);
    starts.push(index);
    previous = index;
  }

  return starts.map((start, index) => ({
    key: copy.route + "-section-" + String(index + 1),
    blocks: copy.blocks.slice(start, starts[index + 1] ?? copy.blocks.length),
    anchor: index === 0 ? "hero" : anchors[index - 1],
    index,
  }));
}
