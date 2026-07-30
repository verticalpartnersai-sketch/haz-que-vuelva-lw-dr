"use client";

import { useState, type FormEvent } from "react";

import {
  createSupabaseBrowserClient,
  type SupabaseBrowserConfiguration,
} from "@/server/supabase/browser-client";

import styles from "./auth-panel.module.css";

export function RecoveryForm({
  supabase,
}: {
  supabase: SupabaseBrowserConfiguration;
}) {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const redirectTo = new URL("/auth/confirm", window.location.origin);
    redirectTo.searchParams.set("next", "/auth/restablecer");

    const { error: recoveryError } =
      await createSupabaseBrowserClient(supabase).auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo.toString(),
      });
    if (recoveryError) {
      setError("No pudimos enviar el enlace. Inténtalo nuevamente.");
      setPending(false);
      return;
    }

    setSent(true);
    setPending(false);
  }

  if (sent) {
    return (
      <p className={styles.message} role="status">
        Si el correo está registrado, recibirás un enlace para continuar.
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.field}>
        Correo electrónico
        <input className={styles.input} name="email" type="email" required />
      </label>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <button className={styles.button} disabled={pending} type="submit">
        {pending ? "Enviando…" : "Enviar enlace seguro"}
      </button>
    </form>
  );
}
