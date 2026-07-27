"use client";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";
import { useMockSession } from "@/features/shell/mock-session";

import { AiChat } from "./ai-chat";

function AccessUnavailable({ checking = false }: { checking?: boolean }) {
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
    </div>
  );
}

export function AiPage() {
  const { aiAccess, aiAccessLocked, setAiAccess } = useMockSession();
  const { l } = useLocale();
  const accessLabel =
    aiAccess === "available"
      ? l("disponible", "disponível", "available")
      : aiAccess === "locked"
        ? l("bloqueado", "bloqueado", "locked")
        : l("comprobando", "verificando", "checking");

  return (
    <div className="ai-page">
      {!aiAccessLocked ? <button
        aria-label={`${l(
          "Cambiar acceso mock de IA. Estado actual",
          "Alterar acesso mock de IA. Estado atual",
          "Change mock AI access. Current state",
        )}: ${accessLabel}`}
        className="ai-access-toggle"
        onClick={() => {
          const nextAccess =
            aiAccess === "available"
              ? "locked"
              : aiAccess === "locked"
                ? "unknown"
                : "available";
          setAiAccess(nextAccess);
        }}
        type="button"
      >
        <span>{l("Acceso mock", "Acesso mock", "Mock access")}</span>
        <strong>{accessLabel}</strong>
      </button> : null}

      <div className="ai-stage">
        {aiAccess === "available" ? (
          <AiChat live={aiAccessLocked} />
        ) : (
          <AccessUnavailable checking={aiAccess === "unknown"} />
        )}
      </div>
    </div>
  );
}
