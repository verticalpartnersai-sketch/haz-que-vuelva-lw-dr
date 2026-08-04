"use client";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";

import type { AiUsage } from "./ai-client";

export function AiUsageModal({
  onClose,
  usage,
}: {
  onClose: () => void;
  usage: AiUsage;
}) {
  const { l } = useLocale();
  const expired = !usage.access_active;
  return (
    <div className="ai-usage-backdrop" role="presentation">
      <section
        aria-labelledby="ai-usage-title"
        aria-modal="true"
        className="ai-usage-modal"
        role="dialog"
      >
        <button
          aria-label={l("Cerrar", "Fechar", "Close")}
          className="ai-usage-modal__close"
          onClick={onClose}
          type="button"
        >
          <Icon name="close" />
        </button>
        <span className="ai-usage-modal__mark"><Icon name="spark" weight="fill" /></span>
        <p className="ai-usage-modal__eyebrow">VUELVE IA</p>
        <h2 id="ai-usage-title">
          {expired
            ? l(
                "Tu acceso de 90 días terminó",
                "Seu acesso de 90 dias terminou",
                "Your 90-day access has ended",
              )
            : l("Tu espacio está listo", "Seu espaço está pronto", "Your space is ready")}
        </h2>
        <p>
          {expired
            ? l(
                "Ya utilizaste el periodo completo incluido en tu acceso a VUELVE IA.",
                "Você já utilizou o período completo incluído no seu acesso à VUELVE IA.",
                "You have used the full period included with your VUELVE IA access.",
              )
            : l(
                "Usa cada respuesta para avanzar con una pregunta clara.",
                "Use cada resposta para avançar com uma pergunta clara.",
                "Use each answer to move forward with one clear question.",
              )}
        </p>
        <div className="ai-usage-modal__stats">
          <article>
            <strong>{usage.messages_remaining}</strong>
            <span>{l("respuestas disponibles hoy", "respostas disponíveis hoje", "answers available today")}</span>
          </article>
          <article>
            <strong>{usage.diagnostic_available ? "1" : "0"}</strong>
            <span>{l("diagnóstico disponible", "diagnóstico disponível", "diagnostic available")}</span>
          </article>
          <article>
            <strong>{usage.access_days_remaining}</strong>
            <span>{l("días de acceso restantes", "dias restantes de acesso", "access days remaining")}</span>
          </article>
        </div>
        {!usage.diagnostic_available && usage.diagnostic_next_at ? (
          <small>
            {l("Próximo diagnóstico", "Próximo diagnóstico", "Next diagnostic")}: {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(usage.diagnostic_next_at))}
          </small>
        ) : null}
        {usage.access_expires_at ? (
          <small>
            {expired
              ? l("Acceso finalizado", "Acesso encerrado", "Access ended")
              : l("Acceso disponible hasta", "Acesso disponível até", "Access available until")}
            : {new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(usage.access_expires_at))}
          </small>
        ) : null}
        <button className="ai-usage-modal__continue" onClick={onClose} type="button">
          {expired ? l("Entendido", "Entendi", "Understood") : l("Comenzar", "Começar", "Start")}
        </button>
      </section>
    </div>
  );
}
