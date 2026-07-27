"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/server/supabase/browser-client";

import styles from "./auth-panel.module.css";

export function PasswordForm({ mode = "create" }: { mode?: "create" | "reset" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

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
      await createSupabaseBrowserClient().auth.updateUser({ password });
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
        <input
          className={styles.input}
          minLength={12}
          name="password"
          type="password"
          required
        />
      </label>
      <label className={styles.field}>
        Repite la contraseña
        <input
          className={styles.input}
          minLength={12}
          name="confirmation"
          type="password"
          required
        />
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
