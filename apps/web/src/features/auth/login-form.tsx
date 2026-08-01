"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  createSupabaseBrowserClient,
  type SupabaseBrowserConfiguration,
} from "@/server/supabase/browser-client";

import styles from "./auth-panel.module.css";

export function LoginForm({
  googleEnabled,
  nextPath,
  supabase,
}: {
  googleEnabled: boolean;
  nextPath: string;
  supabase: SupabaseBrowserConfiguration;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const { error: signInError } =
      await createSupabaseBrowserClient(supabase).auth.signInWithPassword({
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

  async function signInWithGoogle() {
    setPending(true);
    setError("");
    const callback = new URL("/auth/confirm", window.location.origin);
    callback.searchParams.set("next", nextPath);
    const { error: oauthError } =
      await createSupabaseBrowserClient(supabase).auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callback.toString(),
          scopes: "openid email profile",
        },
      });
    if (oauthError) {
      setError(
        "No pudimos abrir el acceso con Google. Inténtalo de nuevo o usa tu contraseña.",
      );
      setPending(false);
    }
  }

  return (
    <>
      {googleEnabled ? (
        <>
          <button
            className={styles.oauthButton}
            disabled={pending}
            onClick={signInWithGoogle}
            type="button"
          >
            <span aria-hidden="true" className={styles.googleMark}>
              G
            </span>
            Continuar con Google
          </button>
          <div className={styles.divider}>
            <span>o entra con tu correo</span>
          </div>
        </>
      ) : null}
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
        <label className={styles.field}>
          Contraseña
          <span className={styles.passwordControl}>
            <input
              autoComplete="current-password"
              className={styles.input}
              maxLength={256}
              minLength={12}
              name="password"
              placeholder="Ingresa tu contraseña"
              type={passwordVisible ? "text" : "password"}
              required
            />
            <button
              aria-label={
                passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              aria-pressed={passwordVisible}
              className={styles.passwordToggle}
              onClick={() => setPasswordVisible((visible) => !visible)}
              type="button"
            >
              {passwordVisible ? (
                <EyeSlash aria-hidden="true" />
              ) : (
                <Eye aria-hidden="true" />
              )}
            </button>
          </span>
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
    </>
  );
}
