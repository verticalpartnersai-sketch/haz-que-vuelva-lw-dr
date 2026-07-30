"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  createSupabaseBrowserClient,
  type SupabaseBrowserConfiguration,
} from "@/server/supabase/browser-client";

import styles from "./auth-panel.module.css";

type Factor = {
  id: string;
  friendlyName?: string;
  status: "unverified" | "verified";
};

type Enrollment = {
  factorId: string;
  qrCode: string;
  secret: string;
};

async function readMfaState(configuration: SupabaseBrowserConfiguration) {
  const client = createSupabaseBrowserClient(configuration);
  const [factorResult, assuranceResult] = await Promise.all([
    client.auth.mfa.listFactors(),
    client.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);
  if (factorResult.error || assuranceResult.error) {
    throw new Error("mfa_state_unavailable");
  }
  return {
    assuranceLevel:
      assuranceResult.data.currentLevel === "aal2"
        ? ("aal2" as const)
        : ("aal1" as const),
    factors: factorResult.data.totp.map((factor) => ({
      friendlyName: factor.friendly_name,
      id: factor.id,
      status: factor.status,
    })),
  };
}

export function MfaManager({
  adminRequired = false,
  nextPath = "/",
  supabase,
}: {
  adminRequired?: boolean;
  nextPath?: string;
  supabase: SupabaseBrowserConfiguration;
}) {
  const router = useRouter();
  const [assuranceLevel, setAssuranceLevel] = useState<"aal1" | "aal2">("aal1");
  const [busy, setBusy] = useState(true);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [error, setError] = useState("");
  const [factors, setFactors] = useState<Factor[]>([]);

  async function refresh() {
    try {
      const state = await readMfaState(supabase);
      setFactors(state.factors);
      setAssuranceLevel(state.assuranceLevel);
    } catch {
      setError("No pudimos consultar la protección de tu cuenta.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let active = true;
    void readMfaState(supabase)
      .then((state) => {
        if (!active) return;
        setFactors(state.factors);
        setAssuranceLevel(state.assuranceLevel);
      })
      .catch(() => {
        if (active) {
          setError("No pudimos consultar la protección de tu cuenta.");
        }
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [supabase]);

  async function beginEnrollment() {
    setBusy(true);
    setError("");
    const client = createSupabaseBrowserClient(supabase);
    for (const factor of factors.filter(
      (candidate) => candidate.status === "unverified",
    )) {
      await client.auth.mfa.unenroll({ factorId: factor.id });
    }
    const { data, error: enrollError } = await client.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Haz Que Vuelva",
    });
    if (enrollError) {
      setError("No pudimos crear el autenticador. Inténtalo nuevamente.");
      setBusy(false);
      return;
    }
    setEnrollment({
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    });
    setBusy(false);
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const code = String(form.get("code") ?? "").replace(/\s/g, "");
    const factorId =
      enrollment?.factorId ??
      factors.find((factor) => factor.status === "verified")?.id;
    if (!factorId || !/^\d{6}$/.test(code)) {
      setError("Escribe el código de 6 dígitos de tu autenticador.");
      setBusy(false);
      return;
    }
    const client = createSupabaseBrowserClient(supabase);
    const { data: challenge, error: challengeError } =
      await client.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setError("No pudimos iniciar la verificación.");
      setBusy(false);
      return;
    }
    const { error: verifyError } = await client.auth.mfa.verify({
      challengeId: challenge.id,
      code,
      factorId,
    });
    if (verifyError) {
      setError("El código no es válido o ya expiró.");
      setBusy(false);
      return;
    }
    setEnrollment(null);
    await refresh();
    router.refresh();
  }

  if (busy && factors.length === 0 && !enrollment) {
    return <p className={styles.message}>Consultando seguridad…</p>;
  }

  if (assuranceLevel === "aal2") {
    return (
      <div className={styles.mfaState}>
        <span className={styles.securityBadge}>Protección verificada</span>
        <p className={styles.message}>
          Tu sesión está protegida con un segundo factor.
        </p>
        {adminRequired ? (
          <button
            className={styles.button}
            onClick={() => router.replace(nextPath)}
            type="button"
          >
            Continuar
          </button>
        ) : null}
      </div>
    );
  }

  const verifiedFactor = factors.find(
    (factor) => factor.status === "verified",
  );

  return (
    <div className={styles.mfaState}>
      {enrollment ? (
        <>
          <p className={styles.message}>
            Escanea el código con Google Authenticator, 1Password, Authy u otra
            app compatible.
          </p>
          {/* Supabase returns a local data URI, never an external tracking URL. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Código QR para configurar el autenticador"
            className={styles.qrCode}
            src={enrollment.qrCode}
          />
          <details className={styles.mfaSecret}>
            <summary>No puedo escanear el código</summary>
            <code>{enrollment.secret}</code>
          </details>
        </>
      ) : verifiedFactor ? (
        <p className={styles.message}>
          Confirma el código actual de tu autenticador para continuar.
        </p>
      ) : (
        <>
          <p className={styles.message}>
            Añade un autenticador para proteger tu cuenta incluso si alguien
            descubre tu contraseña.
          </p>
          <button
            className={styles.button}
            disabled={busy}
            onClick={beginEnrollment}
            type="button"
          >
            Configurar autenticador
          </button>
        </>
      )}

      {enrollment || verifiedFactor ? (
        <form className={styles.form} onSubmit={verify}>
          <label className={styles.field}>
            Código de 6 dígitos
            <input
              autoComplete="one-time-code"
              className={styles.input}
              inputMode="numeric"
              maxLength={6}
              name="code"
              pattern="\d{6}"
              required
            />
          </label>
          <button className={styles.button} disabled={busy} type="submit">
            {busy ? "Verificando…" : "Verificar código"}
          </button>
        </form>
      ) : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
