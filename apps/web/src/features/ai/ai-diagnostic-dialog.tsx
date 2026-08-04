"use client";

import { useRef, useState } from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";

export function AiDiagnosticDialog({
  available,
  busy,
  onClose,
  onSubmit,
}: {
  available: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
}) {
  const { l } = useLocale();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  return (
    <div className="ai-usage-backdrop" role="presentation">
      <section aria-modal="true" className="ai-diagnostic-modal" role="dialog">
        <button className="ai-usage-modal__close" onClick={onClose} type="button">
          <Icon name="close" />
        </button>
        <span className="ai-diagnostic-modal__icon"><Icon name="upload" /></span>
        <h2>{l("Diagnóstico de conversación", "Diagnóstico da conversa", "Conversation diagnostic")}</h2>
        <p>
          {l(
            "Sube la exportación .TXT de WhatsApp o el .ZIP que la contiene. No incluyas audios, fotos ni videos.",
            "Envie a exportação .TXT do WhatsApp ou o .ZIP que a contém. Não inclua áudios, fotos nem vídeos.",
            "Upload the WhatsApp .TXT export or the .ZIP containing it. Do not include audio, photos or videos.",
          )}
        </p>
        {!available ? <div className="ai-diagnostic-modal__blocked">
          {l("Ya utilizaste tu diagnóstico de este período.", "Você já usou seu diagnóstico deste período.", "You already used your diagnostic for this period.")}
        </div> : <>
          <input
            accept=".txt,.zip,text/plain,application/zip"
            hidden
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            ref={input}
            type="file"
          />
          <button className="ai-diagnostic-modal__file" onClick={() => input.current?.click()} type="button">
            <Icon name="upload" />
            <span>{file ? file.name : l("Seleccionar archivo", "Selecionar arquivo", "Select file")}</span>
          </button>
          <label className="ai-diagnostic-modal__consent">
            <input checked={consent} onChange={(event) => setConsent(event.target.checked)} type="checkbox" />
            <span aria-hidden="true" className="ai-diagnostic-modal__checkbox">
              <Icon name="check" weight="bold" />
            </span>
            <span className="ai-diagnostic-modal__consent-copy">{l(
              "Confirmo que tengo autorización para compartir esta conversación y acepto su análisis privado.",
              "Confirmo que tenho autorização para compartilhar esta conversa e aceito sua análise privada.",
              "I confirm I am authorized to share this conversation and accept its private analysis.",
            )}</span>
          </label>
          <button
            className="ai-usage-modal__continue"
            disabled={!file || !consent || busy}
            onClick={() => file && onSubmit(file)}
            type="button"
          >
            {busy ? l("Analizando…", "Analisando…", "Analyzing…") : l("Analizar conversación", "Analisar conversa", "Analyze conversation")}
          </button>
        </>}
      </section>
    </div>
  );
}
