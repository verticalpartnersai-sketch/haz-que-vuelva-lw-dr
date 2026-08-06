import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
export const marketingRoot = path.resolve(scriptDirectory, "..");

export const OFFER_SOURCES = Object.freeze({
  up1: [
    "content/upsells/up1-reconquista-30.es.part-1.md",
    "content/upsells/up1-reconquista-30.es.part-2.md",
  ],
  d1: ["content/upsells/d1-reconquista-30.es.md"],
  up2: ["content/upsells/up2-vuelve-ia.es.md"],
  d2: ["content/upsells/d2-vuelve-ia.es.md"],
});

export const CANONICAL_HASHES = Object.freeze({
  up1: "b2e6def8b9fe519de55f963a3f0e12eae20ee21edad9778a5c539e73aabaa971",
  d1: "66dae7e7d731775e62e0f0ff5a5ac66967daed9b0a13372d0086a8a8344a113f",
  up2: "727bb300e425c3dde94b8d40537ff8ccbb9647047780eb4f885ea9cccda1ad86",
  d2: "63bcab922888ec276f2c10a8c052467ef8a260b26d9925d3ecbafc757b518c4a",
});

export function normalizeSnapshot(source) {
  return source.replace(/\r\n?/g, "\n").trim();
}

function stripInlineMarkdown(value) {
  return value
    .replace(/\\([\\`*_[\]{}()#+\-.!~])/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .trim();
}

function classifyBlock(raw) {
  const lines = raw.split("\n");
  const heading = raw.match(/^(#{1,6})\s+([\s\S]+)$/);

  if (heading) {
    const text = stripInlineMarkdown(heading[2]);
    return {
      type: /^US\$\d/.test(text) ? "price" : "heading",
      level: heading[1].length,
      text,
    };
  }

  if (lines.every((line) => /^-\s+/.test(line))) {
    const items = lines.map((line) => stripInlineMarkdown(line.replace(/^-\s+/, "")));
    return { type: "list", text: items.join("\n"), items };
  }

  if (lines.length === 1 && /^\*\*[\s\S]+\*\*$/.test(raw)) {
    const text = stripInlineMarkdown(raw);
    const type = /^SÍ, QUIERO\b/.test(text) ? "positive_cta" : "strong_paragraph";
    return { type, text };
  }

  if (lines.length === 1 && /^`[\s\S]+`$/.test(raw)) {
    const text = stripInlineMarkdown(raw);
    return {
      type: /^No, gracias\./.test(text) ? "negative_cta" : "inline_note",
      text,
    };
  }

  if (/^P\.D\.(?:\s|\d)/.test(raw)) {
    return { type: "postscript", text: stripInlineMarkdown(raw) };
  }

  if (
    lines.length === 2 &&
    lines[0].trim() === "Política de privacidad" &&
    lines[1].trim() === "Términos de uso"
  ) {
    return {
      type: "legal_links",
      text: stripInlineMarkdown(raw),
      items: lines.map((line) => stripInlineMarkdown(line)),
    };
  }

  if (lines.length === 1 && /^\*[^*][\s\S]*\*$/.test(raw)) {
    return { type: "emphasis", text: stripInlineMarkdown(raw) };
  }

  return { type: "paragraph", text: stripInlineMarkdown(raw) };
}

export function parseSnapshot(route, sourcePath, source) {
  const normalized = normalizeSnapshot(source);
  const rawBlocks = normalized.split(/\n{2,}/);
  const blocks = rawBlocks.map((raw, index) => ({
    id: route + "-block-" + String(index + 1),
    index,
    raw,
    ...classifyBlock(raw),
  }));

  return {
    route,
    source: sourcePath,
    sourceHash: createHash("sha256").update(normalized).digest("hex"),
    raw: normalized,
    blocks,
  };
}

export async function loadOffer(route) {
  const sourcePaths = OFFER_SOURCES[route];
  if (!sourcePaths) {
    throw new Error("Unknown offer route: " + route);
  }

  const parts = await Promise.all(
    sourcePaths.map((sourcePath) => readFile(path.join(marketingRoot, sourcePath), "utf8")),
  );
  const source = parts.map(normalizeSnapshot).join("\n\n");
  return parseSnapshot(route, offerSourceLabel(route), source);
}

export function offerSourceLabel(route) {
  return OFFER_SOURCES[route].join(" + ");
}

export async function compileOffers() {
  const offers = {};
  for (const route of Object.keys(OFFER_SOURCES)) {
    offers[route] = await loadOffer(route);
  }
  return offers;
}
