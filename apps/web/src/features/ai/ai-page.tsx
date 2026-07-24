"use client";

import { useState } from "react";

import { Icon } from "@/components/icon";
import { useMockSession } from "@/features/shell/mock-session";

type ChatState = "conversation" | "empty" | "thinking" | "error" | "limit";

const histories = [
  "Conversación de ejemplo",
  "Reflexión guardada",
  "Ideas para continuar",
] as const;

function StateControl({
  state,
  onChange,
}: {
  state: ChatState;
  onChange: (state: ChatState) => void;
}) {
  return (
    <div className="demo-toolbar demo-toolbar--compact">
      <span>
        <strong>Estado simulado</strong>
        <small>No se envían mensajes.</small>
      </span>
      <select
        aria-label="Estado simulado del chat"
        onChange={(event) => onChange(event.target.value as ChatState)}
        value={state}
      >
        <option value="conversation">Conversación</option>
        <option value="empty">Vacío</option>
        <option value="thinking">Pensando</option>
        <option value="error">Error</option>
        <option value="limit">Límite</option>
      </select>
    </div>
  );
}

function LockedAi() {
  const { setAiAccess } = useMockSession();

  return (
    <div className="ai-locked">
      <span className="ai-locked__orb">
        <Icon name="lock" />
      </span>
      <span className="eyebrow">Acceso premium · simulación</span>
      <h2>La IA no está incluida en este escenario</h2>
      <p>
        El producto real comprobará la autorización antes de mostrar el chat.
        Aquí puedes alternar el estado únicamente para revisar la interfaz.
      </p>
      <button
        className="button button--secondary"
        onClick={() => setAiAccess("available")}
        type="button"
      >
        Mostrar variante disponible
      </button>
    </div>
  );
}

function UnknownAi() {
  return (
    <div aria-busy="true" className="ai-locked">
      <span className="ai-locked__orb">
        <Icon name="spark" />
      </span>
      <span className="eyebrow">Estado de carga · simulación</span>
      <h2>Comprobando el acceso a la IA</h2>
      <p>
        Mientras el permiso no está resuelto, el chat permanece oculto y no se
        presume acceso.
      </p>
      <div aria-hidden="true" className="thinking-row">
        <span />
        <span />
        <span />
        <small>Comprobando · simulación</small>
      </div>
    </div>
  );
}

function ChatMessages({
  state,
  onRetry,
}: {
  state: ChatState;
  onRetry: () => void;
}) {
  if (state === "empty") {
    return (
      <div className="chat-messages">
        <div className="feedback-panel">
          <Icon name="message" />
          <h2>Aún no hay mensajes</h2>
          <p>Escribe una idea para iniciar esta conversación simulada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-messages">
      <div className="chat-message chat-message--assistant">
        <span className="chat-avatar">
          <Icon name="spark" />
        </span>
        <div>
          <strong>Compañera IA</strong>
          <p>
            Hola. Este es un ejemplo visual del espacio de conversación. ¿Qué
            te gustaría explorar hoy?
          </p>
        </div>
      </div>
      <div className="chat-message chat-message--member">
        <div>
          <strong>Tú</strong>
          <p>Quiero organizar mis próximos pasos con más calma.</p>
        </div>
      </div>
      {state === "conversation" ? (
        <div className="chat-message chat-message--assistant">
          <span className="chat-avatar">
            <Icon name="spark" />
          </span>
          <div>
            <strong>Compañera IA</strong>
            <p>
              Podemos empezar por una sola decisión. Esta respuesta es fija,
              no fue generada por un modelo y no usa memoria externa.
            </p>
          </div>
        </div>
      ) : null}
      {state === "thinking" ? (
        <div
          aria-label="La IA está pensando"
          className="thinking-row"
          role="status"
        >
          <span />
          <span />
          <span />
          <small>Pensando · simulación</small>
        </div>
      ) : null}
      {state === "error" ? (
        <div className="inline-feedback inline-feedback--error" role="alert">
          <Icon name="close" />
          <div>
            <strong>No pudimos responder</strong>
            <p>Error simulado. Tu mensaje no fue enviado.</p>
            <button
              className="button button--ghost button--compact"
              onClick={onRetry}
              type="button"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      ) : null}
      {state === "limit" ? (
        <div className="inline-feedback">
          <Icon name="message" />
          <div>
            <strong>Límite de ejemplo alcanzado</strong>
            <p>Este estado no aplica un límite real ni calcula consumo.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AiPage() {
  const { aiAccess, setAiAccess } = useMockSession();
  const [state, setState] = useState<ChatState>("conversation");
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const composerDisabled = state === "thinking" || state === "limit";
  const composerHelp =
    state === "thinking"
      ? "Espera a que termine la respuesta simulada."
      : state === "limit"
        ? "El envío está desactivado mientras se muestra el límite simulado."
        : notice || "Tus mensajes no salen de este navegador.";

  return (
    <div className="ai-page page-frame">
      <header className="page-heading page-heading--row">
        <div>
          <span className="eyebrow">Conversación premium</span>
          <h1 data-route-heading tabIndex={-1}>
            IA
          </h1>
          <p>Interfaz estática: sin modelo, memoria, RAG ni llamadas externas.</p>
        </div>
        <button
          aria-label={`Cambiar acceso mock de IA. Estado actual: ${
            aiAccess === "available"
              ? "Disponible"
              : aiAccess === "locked"
                ? "Bloqueado"
                : "Comprobando"
          }`}
          className="mock-toggle"
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
          <span>Acceso mock</span>
          <strong>
            {aiAccess === "available"
              ? "Disponible"
              : aiAccess === "locked"
                ? "Bloqueado"
                : "Comprobando"}
          </strong>
        </button>
      </header>

      {aiAccess === "locked" ? (
        <LockedAi />
      ) : aiAccess === "unknown" ? (
        <UnknownAi />
      ) : (
        <div className="chat-shell">
          <aside aria-label="Historial de ejemplo" className="chat-history">
            <div>
              <span className="section-kicker">Historial local</span>
              <h2>Conversaciones</h2>
            </div>
            <button className="button button--secondary button--full" type="button">
              <Icon name="message" />
              Nueva conversación
            </button>
            <ul>
              {histories.map((history, index) => (
                <li key={history}>
                  <button
                    aria-current={index === 0 ? "true" : undefined}
                    type="button"
                  >
                    <span>{history}</span>
                    <small>Mock guardado</small>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section aria-labelledby="chat-title" className="chat-panel">
            <div className="chat-panel__top">
              <div>
                <span className="section-kicker">Conversación actual</span>
                <h2 id="chat-title">Un espacio para pensar contigo</h2>
              </div>
              <StateControl onChange={setState} state={state} />
            </div>
            <ChatMessages
              onRetry={() => {
                setState("thinking");
                setNotice("Reintento simulado en curso.");
              }}
              state={state}
            />
            <form
              className="chat-composer"
              onSubmit={(event) => {
                event.preventDefault();
                setNotice(
                  draft.trim()
                    ? "Mensaje no enviado: esta interacción es una simulación."
                    : "Escribe un mensaje de ejemplo antes de continuar.",
                );
              }}
            >
              <label htmlFor="chat-draft">Mensaje de ejemplo</label>
              <div>
                <textarea
                  aria-describedby="chat-composer-help"
                  disabled={composerDisabled}
                  id="chat-draft"
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Escribe aquí…"
                  rows={2}
                  value={draft}
                />
                <button
                  aria-label="Enviar mensaje simulado"
                  className="send-button"
                  disabled={composerDisabled}
                  type="submit"
                >
                  <Icon name="send" />
                </button>
              </div>
              <small aria-live="polite" id="chat-composer-help">
                {composerHelp}
              </small>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
