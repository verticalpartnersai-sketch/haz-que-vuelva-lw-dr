"use client";

import Link from "next/link";
import { useState } from "react";

import { Icon } from "@/components/icon";
import { SelectControl } from "@/components/select-control";
import { useLocale, type Locale } from "@/features/i18n/locale";
import { useMockSession } from "@/features/shell/mock-session";
import { mockMember } from "@/mocks/data";

type ProfileState = "ready" | "loading" | "error";

export function ProfilePage() {
  const { role, roleLocked, setRole } = useMockSession();
  const { l, locale, localeLabel, setLocale, t } = useLocale();
  const [status, setStatus] = useState("");
  const [viewState, setViewState] = useState<ProfileState>("ready");

  return (
    <div className="profile-page page-frame page-frame--top">
      <header className="page-heading page-heading--row">
        <div>
          <h1 data-route-heading tabIndex={-1}>
            {t("profile.title")}
          </h1>
          <p>{t("profile.description")}</p>
        </div>
        <div className="demo-toolbar demo-toolbar--compact">
          <span>
            <strong>{l("Estado simulado", "Estado simulado", "Simulated state")}</strong>
            <small>{l("Datos ficticios", "Dados fictícios", "Fictional data")}</small>
          </span>
          <SelectControl
            ariaLabel={l(
              "Estado simulado del perfil",
              "Estado simulado do perfil",
              "Simulated profile state",
            )}
            className="select-control--compact"
            onChange={setViewState}
            options={[
              { label: l("Listo", "Pronto", "Ready"), value: "ready" },
              { label: l("Cargando", "Carregando", "Loading"), value: "loading" },
              { label: l("Error", "Erro", "Error"), value: "error" },
            ]}
            value={viewState}
          />
        </div>
      </header>

      {viewState === "loading" ? (
        <section
          aria-busy="true"
          aria-label={l(
            "Cargando perfil simulado",
            "Carregando perfil simulado",
            "Loading simulated profile",
          )}
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
          <h2>
            {l(
              "No pudimos mostrar el perfil",
              "Não foi possível mostrar o perfil",
              "We could not display the profile",
            )}
          </h2>
          <p>
            {l(
              "Error simulado: ningún dato real fue consultado.",
              "Erro simulado: nenhum dado real foi consultado.",
              "Simulated error: no real data was queried.",
            )}
          </p>
          <button
            className="button button--secondary"
            onClick={() => setViewState("ready")}
            type="button"
          >
            <Icon name="arrowRight" />
            {l("Intentar de nuevo", "Tentar novamente", "Try again")}
          </button>
        </section>
      ) : (
        <div className="profile-layout">
        <section aria-labelledby="identity-title" className="surface-card identity-card">
          <div className="identity-card__avatar" aria-hidden="true">
            A
          </div>
          <div>
            <span className="section-kicker">
              {l("Identidad", "Identidade", "Identity")}
            </span>
            <h2 id="identity-title">{mockMember.name}</h2>
            <p>{mockMember.email}</p>
          </div>
          <span className="status-badge status-badge--available">
            <Icon name="check" />
            {l("Perfil mock", "Perfil mock", "Mock profile")}
          </span>
        </section>

        {!roleLocked ? (
          <section aria-labelledby="scenario-title" className="surface-card">
          <div className="card-heading">
            <div>
              <span className="section-kicker">
                {l("Escenario de revisión", "Cenário de revisão", "Review scenario")}
              </span>
              <h2 id="scenario-title">
                {l("Papel simulado", "Papel simulado", "Simulated role")}
              </h2>
            </div>
            <span className="mock-chip">
              {l("Sin autenticación", "Sem autenticação", "No authentication")}
            </span>
          </div>
          <p>
            {l(
              "La opción admin muestra Administración en la barra lateral. No concede permisos ni crea una sesión real.",
              "A opção admin mostra Administração na barra lateral. Ela não concede permissões nem cria uma sessão real.",
              "The admin option reveals Administration in the sidebar. It grants no permissions and creates no real session.",
            )}
          </p>
          <div
            aria-label={l(
              "Seleccionar papel simulado",
              "Selecionar papel simulado",
              "Select simulated role",
            )}
            className="segmented-control"
          >
            <button
              aria-pressed={role === "member"}
              onClick={() => setRole("member")}
              type="button"
            >
              {l("Miembro", "Membro", "Member")}
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
        ) : null}

        <section aria-labelledby="preferences-title" className="surface-card profile-preferences">
          <div className="card-heading">
            <div>
              <span className="section-kicker">
                {l("Preferencias", "Preferências", "Preferences")}
              </span>
              <h2 id="preferences-title">
                {l("Tu experiencia", "Sua experiência", "Your experience")}
              </h2>
            </div>
          </div>
          <div className="field-grid">
            <div className="field-control">
              <span className="field-control__label">
                {l("Idioma", "Idioma", "Language")}
              </span>
              <SelectControl
                ariaLabel={l(
                  "Idioma de la interfaz",
                  "Idioma da interface",
                  "Interface language",
                )}
                onChange={(value) => setLocale(value as Locale)}
                options={[
                  { label: "Español", value: "es" },
                  { label: "Português", value: "pt" },
                  { label: "English", value: "en" },
                ]}
                value={locale}
              />
              <small>
                {l(
                  "Selección local activa",
                  "Seleção local ativa",
                  "Active local selection",
                )}
                : {localeLabel}.
              </small>
            </div>
            <label>
              <span>{l("Notificaciones", "Notificações", "Notifications")}</span>
              <input
                readOnly
                value={l(
                  mockMember.notifications,
                  "Resumo semanal",
                  "Weekly summary",
                )}
              />
              <small>
                {l(
                  "Preferencia de ejemplo.",
                  "Preferência de exemplo.",
                  "Example preference.",
                )}
              </small>
            </label>
          </div>
          <button
            className="button button--secondary"
            onClick={() =>
              setStatus(
                l(
                  "Cambio de correo simulado. No se modificó ningún dato.",
                  "Alteração de e-mail simulada. Nenhum dado foi modificado.",
                  "Email change simulated. No data was modified.",
                ),
              )
            }
            type="button"
          >
            <Icon name="settings" />
            {l(
              "Simular cambio de correo",
              "Simular alteração de e-mail",
              "Simulate email change",
            )}
          </button>
          <p aria-live="polite" className="form-status">
            {status}
          </p>
        </section>

        <section aria-labelledby="account-title" className="surface-card mobile-account-actions">
          <span className="section-kicker">
            {l("Cuenta", "Conta", "Account")}
          </span>
          <h2 id="account-title">{l("Acciones", "Ações", "Actions")}</h2>
          {role === "admin" ? (
            <Link className="button button--secondary" href="/administracion">
              <Icon name="settings" />
              {l("Administración", "Administração", "Administration")}
            </Link>
          ) : null}
          <button
            className="button button--ghost"
            onClick={() =>
              setStatus(
                l(
                  "Cierre de sesión simulado.",
                  "Saída simulada.",
                  "Simulated sign out.",
                ),
              )
            }
            type="button"
          >
            <Icon name="logout" />
            {l("Cerrar sesión", "Sair", "Sign out")}
          </button>
        </section>
        </div>
      )}
    </div>
  );
}
