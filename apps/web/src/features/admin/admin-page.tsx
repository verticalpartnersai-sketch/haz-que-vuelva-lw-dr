"use client";

import Link from "next/link";
import { useState } from "react";

import { Icon } from "@/components/icon";
import { useMockSession } from "@/features/shell/mock-session";

const sections = [
  { title: "Productos", detail: "Catálogo y permisos", icon: "library" },
  { title: "Contenido", detail: "Archivos y materiales", icon: "book" },
  { title: "Miembros", detail: "Perfiles e invitaciones", icon: "user" },
  { title: "Accesos", detail: "Concesiones manuales", icon: "lock" },
  { title: "Compras y eventos", detail: "Historial estructural", icon: "message" },
  { title: "IA", detail: "Prompts y documentos", icon: "spark" },
] as const;

type AdminSection = (typeof sections)[number]["title"];

export function AdminPage() {
  const { role, setRole } = useMockSession();
  const [activeSection, setActiveSection] = useState<AdminSection>(
    sections[0].title,
  );

  if (role !== "admin") {
    return (
      <div className="page-frame">
        <div className="feedback-panel">
          <Icon name="lock" />
          <span className="eyebrow">Escenario member</span>
          <h1 data-route-heading tabIndex={-1}>
            Administración no disponible
          </h1>
          <p>
            Esta ruta está oculta para miembro. Puedes activar el escenario
            admin desde Perfil para revisar el esqueleto visual.
          </p>
          <Link className="button button--secondary" href="/perfil">
            Ir a Perfil
          </Link>
          <button
            className="button button--ghost"
            onClick={() => setRole("admin")}
            type="button"
          >
            Activar admin mock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page page-frame">
      <header className="page-heading page-heading--row">
        <div>
          <span className="eyebrow">Escenario admin · prototipo</span>
          <h1 data-route-heading tabIndex={-1}>
            Administración
          </h1>
          <p>Estructura visual sin formularios, datos reales ni operaciones.</p>
        </div>
        <span className="status-badge status-badge--locked">
          <Icon name="settings" />
          Solo mock
        </span>
      </header>

      <section aria-labelledby="summary-title" className="admin-summary">
        <h2 className="sr-only" id="summary-title">Resumen simulado</h2>
        <div>
          <span>Productos mock</span>
          <strong>08</strong>
          <small>Sin catálogo conectado</small>
        </div>
        <div>
          <span>Miembros mock</span>
          <strong>—</strong>
          <small>Sin base de datos</small>
        </div>
        <div>
          <span>Eventos mock</span>
          <strong>00</strong>
          <small>Sin webhooks</small>
        </div>
      </section>

      <section aria-labelledby="modules-title" className="admin-modules">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Mapa administrativo</span>
            <h2 id="modules-title">Módulos previstos</h2>
          </div>
        </div>
        <nav aria-label="Módulos administrativos simulados">
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
                  <span className="mock-chip">Estructura</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <section aria-labelledby="activity-title" className="surface-card">
        <div className="card-heading">
          <div>
            <span className="section-kicker">Actividad</span>
            <h2 id="activity-title">{activeSection} · sin datos conectados</h2>
          </div>
        </div>
        <div className="table-skeleton" aria-label="Tabla administrativa simulada">
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>
    </div>
  );
}
