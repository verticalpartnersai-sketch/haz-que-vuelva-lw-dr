import Link from "next/link";

type DecisionActionsProps = {
  acceptHref: string | null;
  declineHref: string;
  positiveLabel: string;
  negativeLabel: string;
  decisionId?: string;
  compact?: boolean;
};

export function DecisionActions({
  acceptHref,
  declineHref,
  positiveLabel,
  negativeLabel,
  decisionId,
  compact = false,
}: DecisionActionsProps) {
  return (
    <div
      className={"pp-decision" + (compact ? " pp-decision--compact" : "")}
      id={decisionId}
    >
      {acceptHref ? (
        <a className="pp-decision__accept" href={acceptHref} rel="nofollow">
          {positiveLabel}
        </a>
      ) : (
        <span
          aria-disabled="true"
          className="pp-decision__accept pp-decision__accept--disabled"
          title="La oferta no está disponible en este momento."
        >
          {positiveLabel}
        </span>
      )}
      <Link className="pp-decision__decline" href={declineHref} rel="nofollow">
        {negativeLabel}
      </Link>
    </div>
  );
}
