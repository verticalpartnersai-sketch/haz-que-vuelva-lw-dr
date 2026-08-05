import type { ReactNode } from "react";

const INLINE_PATTERN = /(\*\*([^*]+)\*\*|~~([^~]+)~~|`([^`]+)`|\*([^*]+)\*)/g;

function renderLine(line: string, keyPrefix: string) {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = INLINE_PATTERN.exec(line)) !== null) {
    if (match.index > cursor) nodes.push(line.slice(cursor, match.index));
    const key = keyPrefix + "-inline-" + String(match.index);
    if (match[2]) nodes.push(<strong key={key}>{match[2]}</strong>);
    else if (match[3]) nodes.push(<del key={key}>{match[3]}</del>);
    else if (match[4]) nodes.push(<code key={key}>{match[4]}</code>);
    else if (match[5]) nodes.push(<em key={key}>{match[5]}</em>);
    cursor = match.index + match[0].length;
  }

  if (cursor < line.length) nodes.push(line.slice(cursor));
  INLINE_PATTERN.lastIndex = 0;
  return nodes;
}

export function OfferInline({ raw }: { raw: string }) {
  const lines = raw.split("\n");
  return lines.map((line, index) => (
    <span key={"line-" + String(index)}>
      {renderLine(line.replace(/\s{2}$/, ""), "line-" + String(index))}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ));
}
