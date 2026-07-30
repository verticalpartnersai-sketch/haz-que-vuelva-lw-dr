"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

import type { AdminWorkspace } from "@/modules/admin/application/load-admin-workspace";

type Method = "PATCH" | "POST";
async function reauthenticatedMutation(input: {
  body?: unknown;
  method?: Method;
  password: string;
  path: string;
}) {
  const reauthentication = await fetch("/api/admin/reauthenticate", {
    body: JSON.stringify({ password: input.password }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  if (!reauthentication.ok) {
    const payload = (await reauthentication.json().catch(() => null)) as {
      code?: string;
    } | null;
    throw new Error(payload?.code ?? "admin_reauthentication_failed");
  }

  const response = await fetch(input.path, {
    body: input.body === undefined ? undefined : JSON.stringify(input.body),
    headers:
      input.body === undefined ? undefined : { "content-type": "application/json" },
    method: input.method ?? "POST",
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      code?: string;
    } | null;
    throw new Error(payload?.code ?? "admin_operation_failed");
  }
}
function OperationForm({
  children,
  label,
  onSubmit,
}: {
  children: ReactNode;
  label: string;
  onSubmit: (form: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("pending");
    setMessage("");
    try {
      await onSubmit(new FormData(event.currentTarget));
      event.currentTarget.reset();
      setStatus("success");
      setMessage("Operación completada y registrada en la auditoría.");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message.replaceAll("_", " ")
          : "No fue posible completar la operación.",
      );
    }
  }

  return (
    <form className="admin-operation-form" onSubmit={submit}>
      {children}
      <label>
        <span>Confirma tu contraseña</span>
        <input
          autoComplete="current-password"
          maxLength={256}
          name="password"
          required
          type="password"
        />
      </label>
      <button className="button button--primary" disabled={status === "pending"}>
        {status === "pending" ? "Procesando…" : label}
      </button>
      {message ? (
        <p className={`admin-operation-status admin-operation-status--${status}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
function value(form: FormData, key: string) {
  return String(form.get(key) ?? "");
}
function MemberSelect({
  members,
  name = "memberId",
}: {
  members: AdminWorkspace["members"];
  name?: string;
}) {
  return (
    <label>
      <span>Miembro</span>
      <select name={name} required>
        <option value="">Selecciona una persona</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.displayName || member.email}
          </option>
        ))}
      </select>
    </label>
  );
}
function ProductSelect({
  products,
}: {
  products: AdminWorkspace["products"];
}) {
  return (
    <label>
      <span>Producto</span>
      <select name="productCode" required>
        {products.map((product) => (
          <option key={product.code} value={product.code}>
            {product.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function MemberInvitationForm({
  workspace,
}: {
  workspace: AdminWorkspace;
}) {
  return (
    <OperationForm
      label="Crear o reenviar invitación"
      onSubmit={(form) =>
        reauthenticatedMutation({
          body: {
            displayName: value(form, "displayName"),
            email: value(form, "email"),
            requestId: crypto.randomUUID(),
          },
          password: value(form, "password"),
          path: "/api/admin/members/invitations",
        })
      }
    >
      <label>
        <span>Correo del miembro</span>
        <input autoComplete="off" maxLength={254} name="email" required type="email" />
      </label>
      <label>
        <span>Nombre visible</span>
        <input maxLength={120} name="displayName" />
      </label>
      <small>{workspace.members.length} perfiles registrados actualmente.</small>
    </OperationForm>
  );
}

export function AccessOperationForms({
  workspace,
}: {
  workspace: AdminWorkspace;
}) {
  return (
    <div className="admin-operation-grid">
      <OperationForm
        label="Conceder acceso"
        onSubmit={(form) =>
          reauthenticatedMutation({
            body: {
              memberId: value(form, "memberId"),
              productCode: value(form, "productCode"),
              reason: value(form, "reason"),
            },
            password: value(form, "password"),
            path: "/api/admin/access-grants",
          })
        }
      >
        <MemberSelect members={workspace.members} />
        <ProductSelect products={workspace.products} />
        <label>
          <span>Motivo auditable</span>
          <textarea maxLength={500} minLength={8} name="reason" required />
        </label>
      </OperationForm>
      <OperationForm
        label="Revocar acceso"
        onSubmit={(form) =>
          reauthenticatedMutation({
            body: { reason: value(form, "reason") },
            password: value(form, "password"),
            path: `/api/admin/access-grants/${value(form, "grantId")}/revocations`,
          })
        }
      >
        <label>
          <span>Concesión vigente</span>
          <select name="grantId" required>
            <option value="">Selecciona un acceso</option>
            {workspace.grants
              .filter((grant) => !grant.revokedAt)
              .map((grant) => (
                <option key={grant.id} value={grant.id}>
                  {grant.productCode} ·{" "}
                  {workspace.members.find((member) => member.id === grant.memberId)
                    ?.email ?? grant.memberId}
                </option>
              ))}
          </select>
        </label>
        <label>
          <span>Motivo auditable</span>
          <textarea maxLength={500} minLength={8} name="reason" required />
        </label>
      </OperationForm>
    </div>
  );
}

export function CatalogOperationForms({
  workspace,
}: {
  workspace: AdminWorkspace;
}) {
  return (
    <div className="admin-operation-grid">
      <OperationForm
        label="Actualizar producto"
        onSubmit={(form) =>
          reauthenticatedMutation({
            body: {
              active: form.get("active") === "on",
              description: value(form, "description"),
              name: value(form, "name"),
              sortOrder: Number(value(form, "sortOrder")),
            },
            method: "PATCH",
            password: value(form, "password"),
            path: `/api/admin/catalog/products/${value(form, "productCode")}`,
          })
        }
      >
        <ProductSelect products={workspace.products} />
        <label>
          <span>Nombre</span>
          <input maxLength={160} minLength={3} name="name" required />
        </label>
        <label>
          <span>Descripción</span>
          <textarea maxLength={1200} name="description" />
        </label>
        <label>
          <span>Orden</span>
          <input max={10_000} min={0} name="sortOrder" required type="number" />
        </label>
        <label className="admin-operation-check">
          <input name="active" type="checkbox" /> Producto activo
        </label>
      </OperationForm>
      <OperationForm
        label="Guardar oferta Perfect Pay"
        onSubmit={(form) =>
          reauthenticatedMutation({
            body: {
              active: form.get("active") === "on",
              checkoutUrl: value(form, "checkoutUrl"),
              externalPlanCode: value(form, "externalPlanCode"),
              externalProductCode: value(form, "externalProductCode"),
              productCode: value(form, "productCode"),
            },
            password: value(form, "password"),
            path: "/api/admin/catalog/offers",
          })
        }
      >
        <ProductSelect products={workspace.products} />
        <label>
          <span>Código externo del producto</span>
          <input maxLength={160} name="externalProductCode" required />
        </label>
        <label>
          <span>Código externo del plan</span>
          <input maxLength={160} name="externalPlanCode" required />
        </label>
        <label>
          <span>Checkout HTTPS</span>
          <input maxLength={2048} name="checkoutUrl" type="url" />
        </label>
        <label className="admin-operation-check">
          <input name="active" type="checkbox" /> Mapeo activo
        </label>
      </OperationForm>
    </div>
  );
}

export function PurchaseTransferForm({
  workspace,
}: {
  workspace: AdminWorkspace;
}) {
  return (
    <OperationForm
      label="Transferir compra"
      onSubmit={(form) =>
        reauthenticatedMutation({
          body: {
            reason: value(form, "reason"),
            targetMemberId: value(form, "targetMemberId"),
          },
          password: value(form, "password"),
          path: `/api/admin/purchases/${value(form, "purchaseId")}/transfer`,
        })
      }
    >
      <label>
        <span>Compra</span>
        <select name="purchaseId" required>
          <option value="">Selecciona una compra</option>
          {workspace.purchases.map((purchase) => (
            <option key={purchase.id} value={purchase.id}>
              {purchase.externalSaleCode}
            </option>
          ))}
        </select>
      </label>
      <MemberSelect members={workspace.members} name="targetMemberId" />
      <label>
        <span>Motivo auditable</span>
        <textarea maxLength={500} minLength={8} name="reason" required />
      </label>
    </OperationForm>
  );
}

export function AiPromptOperationForms({
  workspace,
}: {
  workspace: AdminWorkspace;
}) {
  return (
    <div className="admin-operation-grid">
      <OperationForm
        label="Crear borrador"
        onSubmit={(form) =>
          reauthenticatedMutation({
            body: { prompt: value(form, "prompt") },
            password: value(form, "password"),
            path: "/api/admin/ai/prompts",
          })
        }
      >
        <label>
          <span>Prompt versionado</span>
          <textarea maxLength={40_000} minLength={80} name="prompt" required rows={10} />
        </label>
      </OperationForm>
      <OperationForm
        label="Publicar versión"
        onSubmit={(form) =>
          reauthenticatedMutation({
            password: value(form, "password"),
            path: `/api/admin/ai/prompts/${value(form, "promptId")}/publish`,
          })
        }
      >
        <label>
          <span>Versión</span>
          <select name="promptId" required>
            <option value="">Selecciona un borrador</option>
            {workspace.prompts.map((prompt) => (
              <option key={prompt.id} value={prompt.id}>
                v{prompt.version} · {prompt.publishedAt ? "publicada" : "borrador"}
              </option>
            ))}
          </select>
        </label>
      </OperationForm>
    </div>
  );
}
