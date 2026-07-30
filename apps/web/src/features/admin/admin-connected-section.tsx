"use client";

import type { AdminWorkspace } from "@/modules/admin/application/load-admin-workspace";

import { AdminContentUpload } from "./admin-content-upload";
import {
  AccessOperationForms,
  AiPromptOperationForms,
  CatalogOperationForms,
  MemberInvitationForm,
  PurchaseTransferForm,
} from "./admin-operation-forms";

export type AdminSection =
  | "Productos"
  | "Contenido"
  | "Miembros"
  | "Accesos"
  | "Compras y eventos"
  | "IA";

function date(value: string | null) {
  if (!value) return "Pendiente";
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function memberLabel(workspace: AdminWorkspace, memberId: string | null) {
  if (!memberId) return "Sin vincular";
  return (
    workspace.members.find((member) => member.id === memberId)?.email ??
    memberId.slice(0, 8)
  );
}

export function AdminConnectedSection({
  activeSection,
  contentConnected,
  workspace,
}: {
  activeSection: AdminSection;
  contentConnected: boolean;
  workspace: AdminWorkspace;
}) {
  if (activeSection === "Contenido") {
    return contentConnected ? (
      <section className="surface-card">
        <AdminContentUpload />
      </section>
    ) : (
      <section className="feedback-panel">
        <h2>Contenido privado desactivado</h2>
        <p>
          Activa FEATURE_CONTENT solo después de configurar el bucket privado y
          validar las políticas de acceso.
        </p>
      </section>
    );
  }

  if (activeSection === "Productos") {
    return (
      <div className="admin-connected-stack">
        <section className="surface-card admin-data-panel">
          <header>
            <span className="section-kicker">Catálogo conectado</span>
            <h2>Productos y ofertas externas</h2>
          </header>
          <div className="admin-data-list">
            {workspace.products.map((product) => {
              const offers = workspace.offers.filter(
                (offer) => offer.productCode === product.code,
              );
              return (
                <article className="admin-data-row" key={product.code}>
                  <div>
                    <strong>{product.name}</strong>
                    <small>{product.code}</small>
                  </div>
                  <div>
                    <span>{offers.length} oferta(s)</span>
                    <small>
                      {offers.some((offer) => offer.active)
                        ? "Mapeo activo"
                        : "Sin mapeo activo"}
                    </small>
                  </div>
                  <span
                    className={`status-badge status-badge--${
                      product.active ? "available" : "locked"
                    }`}
                  >
                    {product.active ? "Activo" : "Inactivo"}
                  </span>
                </article>
              );
            })}
          </div>
        </section>
        <section className="surface-card admin-data-panel">
          <header>
            <span className="section-kicker">Operaciones sensibles</span>
            <h2>Configurar catálogo</h2>
          </header>
          <CatalogOperationForms workspace={workspace} />
        </section>
      </div>
    );
  }

  if (activeSection === "Miembros") {
    return (
      <div className="admin-connected-stack">
        <section className="surface-card admin-data-panel">
          <header>
            <span className="section-kicker">Identidad</span>
            <h2>Miembros e invitaciones</h2>
          </header>
          <div className="admin-data-list">
            {workspace.members.map((member) => (
              <article className="admin-data-row" key={member.id}>
                <div>
                  <strong>{member.displayName || member.email}</strong>
                  <small>{member.email}</small>
                </div>
                <div>
                  <span>{member.role === "admin" ? "Admin" : "Miembro"}</span>
                  <small>Creado {date(member.createdAt)}</small>
                </div>
                <span
                  className={`status-badge status-badge--${
                    member.invitedAt ? "available" : "locked"
                  }`}
                >
                  {member.invitedAt ? "Invitado" : "Invitación pendiente"}
                </span>
              </article>
            ))}
          </div>
        </section>
        <section className="surface-card admin-data-panel">
          <header>
            <span className="section-kicker">Alta controlada</span>
            <h2>Invitar miembro</h2>
          </header>
          <MemberInvitationForm workspace={workspace} />
        </section>
      </div>
    );
  }

  if (activeSection === "Accesos") {
    return (
      <div className="admin-connected-stack">
        <section className="surface-card admin-data-panel">
          <header>
            <span className="section-kicker">Ledger de acceso</span>
            <h2>Concesiones y revocaciones</h2>
          </header>
          <div className="admin-data-list">
            {workspace.grants.map((grant) => (
              <article className="admin-data-row" key={grant.id}>
                <div>
                  <strong>{memberLabel(workspace, grant.memberId)}</strong>
                  <small>{grant.productCode}</small>
                </div>
                <div>
                  <span>
                    {grant.source === "purchase" ? "Compra" : "Concesión manual"}
                  </span>
                  <small>{date(grant.grantedAt)}</small>
                </div>
                <span
                  className={`status-badge status-badge--${
                    grant.revokedAt ? "locked" : "available"
                  }`}
                >
                  {grant.revokedAt ? "Revocado" : "Vigente"}
                </span>
              </article>
            ))}
          </div>
        </section>
        <section className="surface-card admin-data-panel">
          <header>
            <span className="section-kicker">Operaciones sensibles</span>
            <h2>Gestionar acceso</h2>
          </header>
          <AccessOperationForms workspace={workspace} />
        </section>
      </div>
    );
  }

  if (activeSection === "Compras y eventos") {
    return (
      <div className="admin-connected-stack">
        <section className="surface-card admin-data-panel">
          <header>
            <span className="section-kicker">Perfect Pay</span>
            <h2>Compras proyectadas</h2>
          </header>
          <div className="admin-data-list">
            {workspace.purchases.map((purchase) => (
              <article className="admin-data-row" key={purchase.id}>
                <div>
                  <strong>{memberLabel(workspace, purchase.memberId)}</strong>
                  <small>{purchase.externalSaleCode}</small>
                </div>
                <div>
                  <span>
                    {(purchase.amountMinor / 100).toLocaleString("es", {
                      currency: purchase.currency,
                      style: "currency",
                    })}
                  </span>
                  <small>{date(purchase.occurredAt)}</small>
                </div>
                <span className="status-badge status-badge--available">
                  {purchase.status}
                </span>
              </article>
            ))}
          </div>
        </section>
        <section className="surface-card admin-data-panel">
          <header>
            <span className="section-kicker">Corrección auditada</span>
            <h2>Transferir una compra</h2>
          </header>
          <PurchaseTransferForm workspace={workspace} />
        </section>
      </div>
    );
  }

  return (
    <div className="admin-connected-stack">
      <section className="surface-card admin-data-panel">
        <header>
          <span className="section-kicker">Prompts versionados</span>
          <h2>Versiones de Vuelve IA</h2>
        </header>
        <div className="admin-data-list">
          {workspace.prompts.map((prompt) => (
            <article className="admin-data-row" key={prompt.id}>
              <div>
                <strong>Versión {prompt.version}</strong>
                <small>{prompt.prompt.slice(0, 120)}…</small>
              </div>
              <div>
                <span>{prompt.publishedAt ? "Publicada" : "Borrador"}</span>
                <small>{date(prompt.createdAt)}</small>
              </div>
              <span
                className={`status-badge status-badge--${
                  prompt.publishedAt && !prompt.retiredAt ? "available" : "locked"
                }`}
              >
                {prompt.publishedAt && !prompt.retiredAt ? "Actual" : "Histórica"}
              </span>
            </article>
          ))}
        </div>
      </section>
      <section className="surface-card admin-data-panel">
        <header>
          <span className="section-kicker">Operación sensible</span>
          <h2>Crear y publicar prompts</h2>
        </header>
        <AiPromptOperationForms workspace={workspace} />
      </section>
      <section className="surface-card admin-data-panel">
        <header>
          <span className="section-kicker">Auditoría operativa</span>
          <h2>Últimas acciones de IA y administración</h2>
        </header>
        <div className="admin-data-list">
          {workspace.audit.map((entry) => (
            <article className="admin-data-row" key={entry.id}>
              <div>
                <strong>{entry.action}</strong>
                <small>
                  {entry.targetType} · {entry.targetId.slice(0, 18)}
                </small>
              </div>
              <small>{date(entry.occurredAt)}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
