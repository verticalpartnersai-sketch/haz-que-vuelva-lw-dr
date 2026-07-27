"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";

import { createConversation, requestAnswer } from "./ai-client";
import { AiThinkingPanel } from "./ai-thinking-panel";

type ChatMessage = {
  content: string;
  id: string;
  role: "assistant" | "user";
};

function AiHeart({ compact = false }: { compact?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`oracle-heart ${compact ? "oracle-heart--compact" : ""}`.trim()}
    >
      <Icon name="heart" weight="fill" />
    </span>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const { l } = useLocale();

  if (message.role === "user") {
    return (
      <div className="oracle-message oracle-message--user">
        <div>{message.content}</div>
        <small>{l("Tú", "Você", "You")}</small>
      </div>
    );
  }

  return (
    <div className="oracle-message oracle-message--assistant">
      <AiHeart compact />
      <div>
        <strong>VUELVE IA</strong>
        <p>{message.content}</p>
      </div>
    </div>
  );
}

function EmptyConversation({
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

function ChatComposer({
  disabled,
  draft,
  onChange,
  onSubmit,
}: {
  disabled: boolean;
  draft: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
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
        <button
          aria-label={l(
            "Enviar mensaje simulado",
            "Enviar mensagem simulada",
            "Send simulated message",
          )}
          disabled={disabled || !draft.trim()}
          onClick={onSubmit}
          type="button"
        >
          <Icon name="send" weight="bold" />
        </button>
      </div>
    </div>
  );
}

export function AiChat({ live = false }: { live?: boolean }) {
  const { l } = useLocale();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const responseTimer = useRef<number | null>(null);
  const conversationId = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (responseTimer.current) window.clearTimeout(responseTimer.current);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      behavior: "smooth",
      top: scrollRef.current.scrollHeight,
    });
  }, [messages, thinking]);

  async function submitMessage(value = draft) {
    const content = value.trim();
    if (!content || thinking) return;

    setMessages((current) => [
      ...current,
      { content, id: `user-${Date.now()}`, role: "user" },
    ]);
    setDraft("");
    setThinking(true);

    if (live) {
      try {
        conversationId.current ??= await createConversation();
        const answer = await requestAnswer({
          conversationId: conversationId.current,
          message: content,
        });
        setMessages((current) => [
          ...current,
          { content: answer, id: `assistant-${Date.now()}`, role: "assistant" },
        ]);
      } catch {
        setMessages((current) => [
          ...current,
          {
            content: l(
              "No pude responder ahora. Tu crédito no fue consumido. Inténtalo de nuevo.",
              "Não consegui responder agora. Seu crédito não foi consumido. Tente novamente.",
              "I could not respond now. Your credit was not consumed. Try again.",
            ),
            id: `assistant-error-${Date.now()}`,
            role: "assistant",
          },
        ]);
      } finally {
        setThinking(false);
      }
      return;
    }

    responseTimer.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          content: l(
            "Podemos mirar esto con calma y por partes. Empecemos por lo que depende de ti ahora: ¿qué resultado te gustaría obtener de esta situación?",
            "Podemos olhar para isso com calma e por partes. Vamos começar pelo que depende de você agora: qual resultado você gostaria de obter dessa situação?",
            "We can look at this calmly and one part at a time. Let us start with what depends on you now: what outcome would you like from this situation?",
          ),
          id: `assistant-${Date.now()}`,
          role: "assistant",
        },
      ]);
      setThinking(false);
    }, 2400);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submitMessage();
  }

  function resetConversation() {
    if (responseTimer.current) window.clearTimeout(responseTimer.current);
    setDraft("");
    setMessages([]);
    setThinking(false);
    conversationId.current = null;
  }

  return (
    <section aria-labelledby="oracle-chat-title" className="oracle-chat">
      <header className="oracle-chat__header">
        <div>
          <AiHeart compact />
          <span>
            <strong id="oracle-chat-title">VUELVE IA</strong>
            <small>
              {l(
                "Tu espacio para pensar con claridad",
                "Seu espaço para pensar com clareza",
                "Your space to think clearly",
              )}
            </small>
          </span>
        </div>
        <button
          aria-label={l(
            "Nueva conversación",
            "Nova conversa",
            "New conversation",
          )}
          className="oracle-new-chat"
          onClick={resetConversation}
          type="button"
        >
          <Icon name="message" />
          <span>{l("Nueva conversación", "Nova conversa", "New conversation")}</span>
        </button>
      </header>

      <div className="oracle-chat__messages" ref={scrollRef}>
        {messages.length === 0 && !thinking ? (
          <EmptyConversation onSuggestion={(value) => submitMessage(value)} />
        ) : (
          <div className="oracle-chat__thread">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {thinking ? (
              <div className="oracle-message oracle-message--assistant">
                <AiHeart compact />
                <AiThinkingPanel />
              </div>
            ) : null}
          </div>
        )}
      </div>

      <form className="oracle-chat__input" onSubmit={handleSubmit}>
        <ChatComposer
          disabled={thinking}
          draft={draft}
          onChange={setDraft}
          onSubmit={() => submitMessage()}
        />
      </form>
    </section>
  );
}
