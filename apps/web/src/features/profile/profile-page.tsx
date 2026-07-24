"use client";

import Link from "next/link";
import { useState } from "react";

import { Icon } from "@/components/icon";
import { useMockSession } from "@/features/shell/mock-session";
import { mockMember } from "@/mocks/data";

type ProfileState = "ready" | "loading" | "error";

export function ProfilePage() {
  const { role, setRole } = useMockSession();
  const [status, setStatus] = useState("");
  const [viewState, setViewState] = useState<ProfileState>("ready");

  return (
    <div className="profile-page page-frame">
      <header className="page-heading page-heading--row">
        <div>
          <span className="eyebrow">Cuenta de demostración</span>
          <h1 data-route-heading tabIndex={-1}>
            Perfil
          </h1>
          <p>
            Revisa los datos y alterna el papel mock para validar la navegación.
          </p>
        </div>
        <div className="demo-toolbar demo-toolbar--compact">
          <span>
            <strong>Estado simulado</strong>
            <small>Datos ficticios</small>
          </span>
          <select
            aria-label="Estado simulado del perfil"
            onChange={(event) =>
              setViewState(event.target.value as ProfileState)
            }
            value={viewState}
          >
            <option value="ready">Listo</option>
            <option value="loading">Cargando</option>
            <option value="error">Error</option>
          </select>
        </div>
      </header>

      {viewState === "loading" ? (
        <section
          aria-busy="true"
          aria-label="Cargando perfil simulado"
          className="surface-card"
        >
          <div aria-hidden="true" className="table-skeleton">
            <span />
            <span />
            <span />
          </div>
        </section>
      ) : viewState === "error" ? (
        <section className="feedback-panel feedback-panel--error" role="alert">
          <Icon name="close" />
          <h2>No pudimos mostrar el perfil</h2>
          <p>Error simulado: ningún dato real fue consultado.</p>
          <button
            className="button button--secondary"
            onClick={() => setViewState("ready")}
            type="button"
          >
            Intentar de nuevo
          </button>
        </section>
      ) : (
        <div className="profile-layout">
        <section aria-labelledby="identity-title" className="surface-card identity-card">
          <div className="identity-card__avatar" aria-hidden="true">
            A
          </div>
          <div>
            <span className="section-kicker">Identidad</span>
            <h2 id="identity-title">{mockMember.name}</h2>
            <p>{mockMember.email}</p>
          </div>
          <span className="status-badge status-badge--available">
            <Icon name="check" />
            Perfil mock
          </span>
        </section>

        <section aria-labelledby="scenario-title" className="surface-card">
          <div className="card-heading">
            <div>
              <span className="section-kicker">Escenario de revisión</span>
              <h2 id="scenario-title">Papel simulado</h2>
            </div>
            <span className="mock-chip">Sin autenticación</span>
          </div>
          <p>
            La opción admin muestra Administración en la barra lateral. No
            concede permisos ni crea una sesión real.
          </p>
          <div aria-label="Seleccionar papel simulado" className="segmented-control">
            <button
              aria-pressed={role === "member"}
              onClick={() => setRole("member")}
              type="button"
            >
              Miembro
            </button>
            <button
              aria-pressed={role === "admin"}
              onClick={() => setRole("admin")}
              type="button"
            >
              Admin
            </button>
          </div>
        </section>

        <section aria-labelledby="preferences-title" className="surface-card profile-preferences">
          <div className="card-heading">
            <div>
              <span className="section-kicker">Preferencias</span>
              <h2 id="preferences-title">Tu experiencia</h2>
            </div>
          </div>
          <div className="field-grid">
            <label>
              <span>Idioma</span>
              <input readOnly value={mockMember.locale} />
              <small>Campo visual, no guarda cambios.</small>
            </label>
            <label>
              <span>Notificaciones</span>
              <input readOnly value={mockMember.notifications} />
              <small>Preferencia de ejemplo.</small>
            </label>
          </div>
          <button
            className="button button--secondary"
            onClick={() =>
              setStatus("Cambio de correo simulado. No se modificó ningún dato.")
            }
            type="button"
          >
            Simular cambio de correo
          </button>
          <p aria-live="polite" className="form-status">
            {status}
          </p>
        </section>

        <section aria-labelledby="account-title" className="surface-card mobile-account-actions">
          <span className="section-kicker">Cuenta</span>
          <h2 id="account-title">Acciones</h2>
          {role === "admin" ? (
            <Link className="button button--secondary" href="/administracion">
              <Icon name="settings" />
              Administración
            </Link>
          ) : null}
          <button
            className="button button--ghost"
            onClick={() => setStatus("Cierre de sesión simulado.")}
            type="button"
          >
            <Icon name="logout" />
            Cerrar sesión
          </button>
        </section>
        </div>
      )}
    </div>
  );
}
