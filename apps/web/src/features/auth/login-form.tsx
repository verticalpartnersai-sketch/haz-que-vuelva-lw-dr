"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/server/supabase/browser-client";

import styles from "./auth-panel.module.css";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const { error: signInError } =
      await createSupabaseBrowserClient().auth.signInWithPassword({
        email: String(form.get("email") ?? "").trim(),
        password: String(form.get("password") ?? ""),
      });
    if (signInError) {
      setError("No pudimos iniciar sesión. Revisa tus datos e inténtalo otra vez.");
      setPending(false);
      return;
    }
    router.replace(nextPath);
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.field}>
        Correo electrónico
        <input className={styles.input} name="email" type="email" required />
      </label>
      <label className={styles.field}>
        Contraseña
        <input
          className={styles.input}
          minLength={12}
          name="password"
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
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
