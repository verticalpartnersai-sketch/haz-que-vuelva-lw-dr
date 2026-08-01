"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  createSupabaseBrowserClient,
  type SupabaseBrowserConfiguration,
} from "@/server/supabase/browser-client";

import styles from "./auth-panel.module.css";

export function PasswordForm({
  mode = "create",
  supabase,
}: {
  mode?: "create" | "reset";
  supabase: SupabaseBrowserConfiguration;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      setPending(false);
      return;
    }
    const { error: updateError } =
      await createSupabaseBrowserClient(supabase).auth.updateUser({ password });
    if (updateError) {
      setError("No pudimos guardar tu contraseña. Solicita un nuevo enlace.");
      setPending(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.field}>
        Nueva contraseña
        <span className={styles.passwordControl}>
          <input
            autoComplete="new-password"
            className={styles.input}
            minLength={12}
            name="password"
            type={passwordVisible ? "text" : "password"}
            required
          />
          <button
            aria-label={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={passwordVisible}
            className={styles.passwordToggle}
            onClick={() => setPasswordVisible((visible) => !visible)}
            type="button"
          >
            {passwordVisible ? <EyeSlash aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </button>
        </span>
      </label>
      <label className={styles.field}>
        Repite la contraseña
        <span className={styles.passwordControl}>
          <input
            autoComplete="new-password"
            className={styles.input}
            minLength={12}
            name="confirmation"
            type={confirmationVisible ? "text" : "password"}
            required
          />
          <button
            aria-label={confirmationVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={confirmationVisible}
            className={styles.passwordToggle}
            onClick={() => setConfirmationVisible((visible) => !visible)}
            type="button"
          >
            {confirmationVisible ? <EyeSlash aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </button>
        </span>
      </label>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <button className={styles.button} disabled={pending} type="submit">
        {pending
          ? "Guardando…"
          : mode === "reset"
            ? "Actualizar contraseña"
            : "Crear contraseña"}
      </button>
    </form>
  );
}
