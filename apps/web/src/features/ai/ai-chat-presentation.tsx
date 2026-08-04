"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";

export type ChatMessage = {
  content: string;
  id: string;
  kind?: "message" | "usage-warning";
  role: "assistant" | "user";
};

export function AiHeart({ compact = false }: { compact?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`oracle-heart ${compact ? "oracle-heart--compact" : ""}`.trim()}
    >
      <Icon name="heart" weight="fill" />
    </span>
  );
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const { l } = useLocale();

  if (message.role === "user") {
    return (
      <div className="oracle-message oracle-message--user">
        <div>{message.content}</div>
        <small>{l("Tú", "Você", "You")}</small>
      </div>
    );
  }

  if (message.kind === "usage-warning") {
    return (
      <div aria-live="polite" className="oracle-usage-warning" role="status">
        <span aria-hidden="true">⚠️</span>
        <p>{message.content}</p>
      </div>
    );
  }

  return (
    <div className="oracle-message oracle-message--assistant">
      <AiHeart compact />
      <div>
        <strong>VUELVE IA</strong>
        <div className="oracle-markdown">
          <ReactMarkdown
            components={{
              a: ({ children, ...props }) => (
                <a {...props} rel="noreferrer" target="_blank">
                  {children}
                </a>
              ),
            }}
            remarkPlugins={[remarkGfm]}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export function EmptyConversation({
  onSuggestion,
}: {
  onSuggestion: (value: string) => void;
}) {
  const { l } = useLocale();
  const suggestions = [
    l(
      "Quiero entender mejor lo que estoy sintiendo",
      "Quero entender melhor o que estou sentindo",
      "I want to better understand what I am feeling",
    ),
    l(
      "Ayúdame a organizar una conversación difícil",
      "Ajude-me a organizar uma conversa difícil",
      "Help me organize a difficult conversation",
    ),
    l(
      "¿Cómo puedo actuar con más calma?",
      "Como posso agir com mais calma?",
      "How can I act more calmly?",
    ),
    l(
      "Quiero pensar en mi próximo paso",
      "Quero pensar no meu próximo passo",
      "I want to think about my next step",
    ),
  ];

  return (
    <div className="oracle-empty">
      <AiHeart />
      <div>
        <h2>
          {l(
            "¿En qué puedo acompañarte?",
            "Como posso acompanhar você?",
            "How can I support you?",
          )}
        </h2>
        <p>
          {l(
            "Puedes comenzar con una idea, una duda o una situación.",
            "Você pode começar com uma ideia, uma dúvida ou uma situação.",
            "You can start with an idea, a question, or a situation.",
          )}
        </p>
      </div>
      <div className="oracle-suggestions">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestion(suggestion)}
            type="button"
          >
            <Icon name="spark" />
            <span>{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChatComposer({
  disabled,
  draft,
  onChange,
  onSubmit,
  onUpload,
}: {
  disabled: boolean;
  draft: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onUpload: () => void;
}) {
  const { l } = useLocale();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`;
  }, [draft]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="oracle-composer">
      <textarea
        aria-label={l("Escribe tu mensaje", "Escreva sua mensagem", "Write your message")}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={l(
          "Cuéntame qué está pasando…",
          "Conte-me o que está acontecendo…",
          "Tell me what is happening…",
        )}
        ref={textareaRef}
        rows={1}
        value={draft}
      />
      <div className="oracle-composer__footer">
        <small>
          {disabled
            ? l(
                "Preparando una respuesta…",
                "Preparando uma resposta…",
                "Preparing a response…",
              )
            : l(
                "Enter para enviar · Shift + Enter para una nueva línea",
                "Enter para enviar · Shift + Enter para uma nova linha",
                "Enter to send · Shift + Enter for a new line",
              )}
        </small>
        <div className="oracle-composer__actions">
          <button
            aria-label={l("Subir conversación", "Enviar conversa", "Upload conversation")}
            className="oracle-composer__upload"
            disabled={disabled}
            onClick={onUpload}
            type="button"
          >
            <Icon name="plus" weight="bold" />
          </button>
          <button
            aria-label={l("Enviar mensaje", "Enviar mensagem", "Send message")}
            disabled={disabled || !draft.trim()}
            onClick={onSubmit}
            type="button"
          >
            <Icon name="send" weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
