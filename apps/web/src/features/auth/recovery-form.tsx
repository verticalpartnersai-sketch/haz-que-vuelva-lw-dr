"use client";

import { useState, type FormEvent } from "react";

import styles from "./auth-panel.module.css";

export function RecoveryForm() {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();

    const response = await fetch("/api/auth/recovery", {
      body: JSON.stringify({ email }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    if (!response.ok) {
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
        <input
          autoComplete="email"
          className={styles.input}
          maxLength={254}
          name="email"
          placeholder="tu@email.com"
          type="email"
          required
        />
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
