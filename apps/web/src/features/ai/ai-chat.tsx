"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";

import {
  createConversation,
  getLatestConversation,
  requestAnswer,
  requestDiagnostic,
  type AiUsage,
} from "./ai-client";
import { AiDiagnosticDialog } from "./ai-diagnostic-dialog";
import {
  AiHeart,
  ChatComposer,
  EmptyConversation,
  MessageBubble,
  type ChatMessage,
} from "./ai-chat-presentation";
import { AiThinkingPanel } from "./ai-thinking-panel";

export function AiChat({
  live = false,
  onUsageChanged,
  usage,
}: {
  live?: boolean;
  onUsageChanged: () => Promise<AiUsage | undefined>;
  usage: AiUsage | null;
}) {
  const { l } = useLocale();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [restoringConversation, setRestoringConversation] = useState(live);
  const [thinking, setThinking] = useState(false);
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const responseTimer = useRef<number | null>(null);
  const conversationId = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (responseTimer.current) window.clearTimeout(responseTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!live) return;
    let active = true;
    getLatestConversation()
      .then((latest) => {
        if (!active) return;
        conversationId.current = latest.conversationId;
        setMessages(latest.messages);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setRestoringConversation(false);
      });
    return () => {
      active = false;
    };
  }, [live]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      behavior: "smooth",
      top: scrollRef.current.scrollHeight,
    });
  }, [messages, thinking]);

  async function submitMessage(value = draft) {
    const content = value.trim();
    if (!content || thinking || (live && usage?.messages_remaining === 0)) return;

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
        const latestUsage = await onUsageChanged();
        const nextRemaining = latestUsage?.messages_remaining;
        if (nextRemaining !== undefined && nextRemaining <= 5) {
          setMessages((current) => [
            ...current,
            {
              content: l(
                `Te quedan ${nextRemaining} respuestas disponibles en tu ventana actual. Úsalas con preguntas concretas.`,
                `Você tem ${nextRemaining} respostas disponíveis na janela atual. Use-as com perguntas objetivas.`,
                `You have ${nextRemaining} answers left in your current window. Use them with focused questions.`,
              ),
              id: `assistant-limit-${Date.now()}`,
              kind: "usage-warning",
              role: "assistant",
            },
          ]);
        }
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

  async function submitDiagnostic(file: File) {
    if (!live || thinking) return;
    setDiagnosticOpen(false);
    setThinking(true);
    try {
      conversationId.current ??= await createConversation();
      const result = await requestDiagnostic({
        conversationId: conversationId.current,
        file,
      });
      setMessages((current) => [
        ...current,
        {
          content: result.formatted_report,
          id: `assistant-diagnostic-${Date.now()}`,
          role: "assistant",
        },
      ]);
      await onUsageChanged();
    } catch (error) {
      const code = error instanceof Error ? error.message : "diagnostic_unavailable";
      const limitReached = code === "diagnostic_monthly_limit_reached";
      setMessages((current) => [
        ...current,
        {
          content: limitReached
            ? l(
                "Ya utilizaste el diagnóstico disponible en este período. Podrás realizar uno nuevo cuando se renueve tu acceso mensual.",
                "Você já utilizou o diagnóstico disponível neste período. Poderá fazer um novo quando seu acesso mensal for renovado.",
                "You already used the diagnostic available in this period. You can run another when your monthly access renews.",
              )
            : l(
                "No pude analizar ese archivo. Verifica que sea un .TXT de WhatsApp o un .ZIP que contenga solamente archivos .TXT.",
                "Não consegui analisar esse arquivo. Verifique se é um .TXT do WhatsApp ou um .ZIP contendo apenas arquivos .TXT.",
                "I could not analyze that file. Check that it is a WhatsApp .TXT or a .ZIP containing only .TXT files.",
              ),
          id: `assistant-diagnostic-error-${Date.now()}`,
          kind: limitReached ? "usage-warning" : undefined,
          role: "assistant",
        },
      ]);
      await onUsageChanged();
    } finally {
      setThinking(false);
    }
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
          <Icon name="plus" weight="bold" />
          <span>{l("Nueva conversación", "Nova conversa", "New conversation")}</span>
        </button>
      </header>

      <div className="oracle-chat__messages" ref={scrollRef}>
        {messages.length === 0 && !thinking && !restoringConversation ? (
          <EmptyConversation onSuggestion={(value) => submitMessage(value)} />
        ) : restoringConversation ? (
          <div className="oracle-message oracle-message--assistant">
            <AiHeart compact />
            <AiThinkingPanel />
          </div>
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
          disabled={thinking || (live && usage?.messages_remaining === 0)}
          draft={draft}
          onChange={setDraft}
          onSubmit={() => submitMessage()}
          onUpload={() => setDiagnosticOpen(true)}
        />
      </form>
      {diagnosticOpen ? (
        <AiDiagnosticDialog
          available={usage?.diagnostic_available ?? false}
          busy={thinking}
          onClose={() => setDiagnosticOpen(false)}
          onSubmit={submitDiagnostic}
        />
      ) : null}
    </section>
  );
}
