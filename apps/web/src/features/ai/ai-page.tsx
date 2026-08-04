"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";
import { ProductLockedDialog } from "@/features/products/product-locked-dialog";
import { useMockSession } from "@/features/shell/mock-session";
import type { Product } from "@/mocks/types";

import { AiChat } from "./ai-chat";
import { getAiUsage, type AiUsage } from "./ai-client";
import { AiUsageModal } from "./ai-usage-modal";

const vuelveIaProduct: Product = {
  accessState: "locked",
  coverImage: "/images/products/vuelve-ia.webp",
  description:
    "Acompañamiento conversacional durante 90 días, con 10 respuestas cada 24 horas y un diagnóstico de WhatsApp cada 30 días.",
  eyebrow: "Producto adicional",
  id: "vuelve_ia",
  kind: "adicional",
  name: "VUELVE IA™",
  slug: "vuelve-ia",
};

function AccessUnavailable({
  checking = false,
  onPurchase,
  purchaseRef,
}: {
  checking?: boolean;
  onPurchase: () => void;
  purchaseRef: RefObject<HTMLButtonElement | null>;
}) {
  const { l } = useLocale();

  return (
    <div aria-busy={checking} className="ai-access-state">
      <span className={checking ? "is-checking" : ""}>
        <Icon name={checking ? "spark" : "lock"} />
      </span>
      <h2>
        {checking
          ? l(
              "Comprobando tu acceso",
              "Verificando o seu acesso",
              "Checking your access",
            )
          : l(
              "Este espacio necesita acceso premium",
              "Este espaço precisa de acesso premium",
              "This space requires premium access",
            )}
      </h2>
      <p>
        {checking
          ? l(
              "Un momento, estamos preparando tu espacio.",
              "Um momento, estamos preparando o seu espaço.",
              "One moment, we are preparing your space.",
            )
          : l(
              "Cuando este acceso esté disponible, tu conversación aparecerá aquí.",
              "Quando este acesso estiver disponível, sua conversa aparecerá aqui.",
              "When this access is available, your conversation will appear here.",
            )}
      </p>
      {!checking ? (
        <button
          className="button button--primary ai-access-state__purchase"
          onClick={onPurchase}
          ref={purchaseRef}
          type="button"
        >
          {l(
            "Descubrir VUELVE IA",
            "Conhecer a VUELVE IA",
            "Discover VUELVE IA",
          )}
          <Icon name="arrowRight" />
        </button>
      ) : null}
    </div>
  );
}

function AccessExpired({ expiresAt }: { expiresAt: string | null }) {
  const { l } = useLocale();
  const date = expiresAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(
        new Date(expiresAt),
      )
    : null;

  return (
    <div className="ai-access-state ai-access-state--expired">
      <span><Icon name="lock" /></span>
      <p className="ai-access-state__eyebrow">VUELVE IA · 90 DÍAS</p>
      <h2>
        {l(
          "Tu periodo de acceso terminó",
          "Seu período de acesso terminou",
          "Your access period has ended",
        )}
      </h2>
      <p>
        {l(
          "Ya utilizaste los 90 días incluidos en tu acceso a VUELVE IA. El chat y los diagnósticos están bloqueados.",
          "Você já utilizou os 90 dias incluídos no seu acesso à VUELVE IA. O chat e os diagnósticos estão bloqueados.",
          "You have used the 90 days included with your VUELVE IA access. Chat and diagnostics are now locked.",
        )}
      </p>
      {date ? (
        <small>
          {l("Acceso finalizado", "Acesso encerrado", "Access ended")}: {date}
        </small>
      ) : null}
    </div>
  );
}

export function AiPage() {
  const { aiAccess, aiAccessLocked } = useMockSession();
  const [usage, setUsage] = useState<AiUsage | null>(null);
  const [usageOpen, setUsageOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchaseTrigger, setPurchaseTrigger] = useState<HTMLButtonElement | null>(
    null,
  );
  const purchaseRef = useRef<HTMLButtonElement>(null);
  const canReadUsage =
    aiAccessLocked && (aiAccess === "available" || aiAccess === "expired");

  async function refreshUsage() {
    if (!canReadUsage) return undefined;
    const current = await getAiUsage();
    setUsage(current);
    return current;
  }

  useEffect(() => {
    if (!canReadUsage) return;
    getAiUsage()
      .then((current) => {
        setUsage(current);
        setUsageOpen(true);
      })
      .catch(() => undefined);
  }, [canReadUsage]);
  return (
    <div className="ai-page">
      <div className="ai-stage">
        {aiAccess === "available" ? (
          <AiChat live={aiAccessLocked} onUsageChanged={refreshUsage} usage={usage} />
        ) : aiAccess === "expired" ? (
          <AccessExpired expiresAt={usage?.access_expires_at ?? null} />
        ) : (
          <AccessUnavailable
            checking={aiAccess === "unknown"}
            onPurchase={() => {
              setPurchaseTrigger(purchaseRef.current);
              setPurchaseOpen(true);
            }}
            purchaseRef={purchaseRef}
          />
        )}
      </div>
      {usage && usageOpen ? (
        <AiUsageModal onClose={() => setUsageOpen(false)} usage={usage} />
      ) : null}
      {purchaseOpen ? (
        <ProductLockedDialog
          onClose={() => setPurchaseOpen(false)}
          product={vuelveIaProduct}
          returnFocusTo={purchaseTrigger}
          simulated={false}
        />
      ) : null}
    </div>
  );
}
