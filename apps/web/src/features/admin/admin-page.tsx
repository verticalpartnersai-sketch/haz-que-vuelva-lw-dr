"use client";

import Link from "next/link";
import { useState } from "react";

import { Icon } from "@/components/icon";
import {
  AdminConnectedSection,
  type AdminSection,
} from "@/features/admin/admin-connected-section";
import { useLocale } from "@/features/i18n/locale";
import { useMockSession } from "@/features/shell/mock-session";
import type { AdminWorkspace } from "@/modules/admin/application/load-admin-workspace";

const sections = [
  { title: "Productos", detail: "Catálogo y permisos", icon: "library" },
  { title: "Contenido", detail: "Archivos y materiales", icon: "book" },
  { title: "Miembros", detail: "Perfiles e invitaciones", icon: "user" },
  { title: "Accesos", detail: "Concesiones manuales", icon: "lock" },
  { title: "Compras y eventos", detail: "Historial estructural", icon: "message" },
  { title: "IA", detail: "Prompts y documentos", icon: "spark" },
] as const;

export function AdminPage({
  contentConnected,
  workspace,
}: {
  contentConnected: boolean;
  workspace: AdminWorkspace | null;
}) {
  const { role, setRole } = useMockSession();
  const { l, t } = useLocale();
  const [activeSection, setActiveSection] = useState<AdminSection>(
    sections[0].title,
  );

  if (role !== "admin") {
    return (
      <div className="page-frame page-frame--top">
        <div className="feedback-panel">
          <Icon name="lock" />
          <span className="eyebrow">
            {l("Escenario member", "Cenário member", "Member scenario")}
          </span>
          <h1 data-route-heading tabIndex={-1}>
            {l(
              "Administración no disponible",
              "Administração indisponível",
              "Administration unavailable",
            )}
          </h1>
          <p>
            {l(
              "Esta ruta está oculta para miembro. Puedes activar el escenario admin desde Perfil para revisar el esqueleto visual.",
              "Esta rota fica oculta para membro. Você pode ativar o cenário admin no Perfil para revisar o esqueleto visual.",
              "This route is hidden for members. You can activate the admin scenario from Profile to review the visual shell.",
            )}
          </p>
          <Link className="button button--secondary" href="/perfil">
            <Icon name="user" />
            {l("Ir a Perfil", "Ir para Perfil", "Go to Profile")}
          </Link>
          <button
            className="button button--ghost"
            onClick={() => setRole("admin")}
            type="button"
          >
            <Icon name="settings" />
            {l("Activar admin mock", "Ativar admin mock", "Activate mock admin")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page page-frame page-frame--top">
      <header className="page-heading page-heading--row">
        <div>
          <h1 data-route-heading tabIndex={-1}>
            {t("admin.title")}
          </h1>
          <p>{t("admin.description")}</p>
        </div>
        <span
          className={`status-badge status-badge--${
            workspace ? "available" : "locked"
          }`}
        >
          <Icon name={workspace ? "check" : "settings"} />
          {workspace
            ? l(
                "Supabase conectado",
                "Supabase conectado",
                "Supabase connected",
              )
            : l("Solo mock", "Somente mock", "Mock only")}
        </span>
      </header>

      <section aria-labelledby="summary-title" className="admin-summary">
        <h2 className="sr-only" id="summary-title">
          {l("Resumen simulado", "Resumo simulado", "Simulated summary")}
        </h2>
        <div>
          <span>
            {workspace
              ? l("Miembros", "Membros", "Members")
              : l("Productos mock", "Produtos mock", "Mock products")}
          </span>
          <strong>{workspace?.counts.members ?? "08"}</strong>
          <small>
            {workspace
              ? l(
                  "Perfiles registrados",
                  "Perfis registrados",
                  "Registered profiles",
                )
              : l(
                  "Sin catálogo conectado",
                  "Sem catálogo conectado",
                  "No catalog connected",
                )}
          </small>
        </div>
        <div>
          <span>
            {workspace
              ? l("Accesos vigentes", "Acessos vigentes", "Active access")
              : l("Miembros mock", "Membros mock", "Mock members")}
          </span>
          <strong>{workspace?.counts.activeAccess ?? "—"}</strong>
          <small>
            {workspace
              ? l("Ledger efectivo", "Ledger efetivo", "Effective ledger")
              : l("Sin base de datos", "Sem banco de dados", "No database")}
          </small>
        </div>
        <div>
          <span>
            {workspace
              ? l("Eventos recibidos", "Eventos recebidos", "Received events")
              : l("Eventos mock", "Eventos mock", "Mock events")}
          </span>
          <strong>{workspace?.counts.events ?? "00"}</strong>
          <small>
            {workspace
              ? l(
                  `${workspace.counts.purchases} compras proyectadas`,
                  `${workspace.counts.purchases} compras projetadas`,
                  `${workspace.counts.purchases} projected purchases`,
                )
              : l("Sin webhooks", "Sem webhooks", "No webhooks")}
          </small>
        </div>
      </section>

      <section aria-labelledby="modules-title" className="admin-modules">
        <div className="section-heading">
          <div>
            <span className="section-kicker">
              {l(
                "Mapa administrativo",
                "Mapa administrativo",
                "Administration map",
              )}
            </span>
            <h2 id="modules-title">
              {l("Módulos previstos", "Módulos previstos", "Planned modules")}
            </h2>
          </div>
        </div>
        <nav
          aria-label={l(
            workspace
              ? "Módulos administrativos"
              : "Módulos administrativos simulados",
            workspace
              ? "Módulos administrativos"
              : "Módulos administrativos simulados",
            workspace
              ? "Administration modules"
              : "Simulated administration modules",
          )}
        >
          <ul>
            {sections.map((section) => (
              <li key={section.title}>
                <button
                  aria-current={
                    activeSection === section.title ? "page" : undefined
                  }
                  onClick={() => setActiveSection(section.title)}
                  type="button"
                >
                  <span className="admin-module__icon">
                    <Icon name={section.icon} />
                  </span>
                  <span>
                    <strong>{section.title}</strong>
                    <small>{section.detail}</small>
                  </span>
                  <span className="mock-chip">
                    {workspace
                      ? l("Conectado", "Conectado", "Connected")
                      : l("Estructura", "Estrutura", "Structure")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      {workspace ? (
        <AdminConnectedSection
          activeSection={activeSection}
          contentConnected={contentConnected}
          workspace={workspace}
        />
      ) : (
        <section aria-labelledby="activity-title" className="surface-card">
          <div className="card-heading">
            <div>
              <span className="section-kicker">
                {l("Actividad", "Atividade", "Activity")}
              </span>
              <h2 id="activity-title">
                {activeSection} ·{" "}
                {l(
                  "sin datos conectados",
                  "sem dados conectados",
                  "no connected data",
                )}
              </h2>
            </div>
          </div>
          <div
            className="table-skeleton"
            aria-label={l(
              "Tabla administrativa simulada",
              "Tabela administrativa simulada",
              "Simulated administration table",
            )}
          >
            <span />
            <span />
            <span />
            <span />
          </div>
        </section>
      )}
    </div>
  );
}
