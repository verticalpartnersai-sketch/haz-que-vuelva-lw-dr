"use client";

import { useState, type FormEvent } from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";

export function ProfileEmailChange() {
  const { l } = useLocale();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setPending(true);
    setStatus("");

    try {
      const response = await fetch("/api/account/email", {
        body: JSON.stringify({
          email: String(form.get("email") ?? "").trim(),
          password: String(form.get("password") ?? ""),
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });

      if (response.ok) {
        formElement.reset();
        setStatus(
          l(
            "Enviamos enlaces de confirmación a tu correo actual y al nuevo. El cambio solo termina después de confirmar ambos.",
            "Enviamos links de confirmação para seu e-mail atual e para o novo. A alteração só termina depois de confirmar ambos.",
            "We sent confirmation links to your current and new email. The change only completes after both are confirmed.",
          ),
        );
        return;
      }

      const payload = (await response.json().catch(() => ({}))) as {
        code?: string;
      };
      const message =
        payload.code === "invalid_password"
          ? l(
              "La contraseña actual no es válida.",
              "A senha atual não é válida.",
              "The current password is invalid.",
            )
          : payload.code === "email_unchanged"
            ? l(
                "Escribe un correo diferente del actual.",
                "Digite um e-mail diferente do atual.",
                "Enter an email different from the current one.",
              )
            : payload.code === "rate_limited"
              ? l(
                  "Espera un momento antes de solicitar otro cambio.",
                  "Aguarde um momento antes de solicitar outra alteração.",
                  "Wait a moment before requesting another change.",
                )
              : l(
                  "No pudimos iniciar el cambio. Revisa los datos e inténtalo nuevamente.",
                  "Não foi possível iniciar a alteração. Confira os dados e tente novamente.",
                  "We could not start the change. Check the details and try again.",
                );
      setStatus(message);
    } catch {
      setStatus(
        l(
          "La conexión falló. Tu correo no fue modificado.",
          "A conexão falhou. Seu e-mail não foi alterado.",
          "The connection failed. Your email was not changed.",
        ),
      );
    } finally {
      const passwordInput = formElement.elements.namedItem("password");
      if (passwordInput instanceof HTMLInputElement) passwordInput.value = "";
      setPending(false);
    }
  }

  return (
    <form className="profile-email-change" onSubmit={submit}>
      <div className="card-heading">
        <div>
          <span className="section-kicker">
            {l("Seguridad", "Segurança", "Security")}
          </span>
          <h3>
            {l(
              "Cambiar correo electrónico",
              "Alterar e-mail",
              "Change email address",
            )}
          </h3>
        </div>
      </div>
      <p>
        {l(
          "Para proteger tu cuenta, confirma tu contraseña actual. Recibirás un enlace tanto en el correo actual como en el nuevo.",
          "Para proteger sua conta, confirme a senha atual. Você receberá um link no e-mail atual e também no novo.",
          "To protect your account, confirm your current password. You will receive a link at both your current and new email.",
        )}
      </p>
      <div className="field-grid">
        <label>
          <span>{l("Nuevo correo", "Novo e-mail", "New email")}</span>
          <input
            autoComplete="email"
            maxLength={254}
            name="email"
            required
            type="email"
          />
        </label>
        <label>
          <span>
            {l("Contraseña actual", "Senha atual", "Current password")}
          </span>
          <input
            autoComplete="current-password"
            maxLength={256}
            name="password"
            required
            type="password"
          />
        </label>
      </div>
      <button
        className="button button--secondary"
        disabled={pending}
        type="submit"
      >
        <Icon name="settings" />
        {pending
          ? l("Enviando…", "Enviando…", "Sending…")
          : l(
              "Enviar confirmaciones",
              "Enviar confirmações",
              "Send confirmations",
            )}
      </button>
      <p aria-live="polite" className="form-status">
        {status}
      </p>
    </form>
  );
}
