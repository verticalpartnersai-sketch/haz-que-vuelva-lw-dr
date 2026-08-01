import { PasswordForm } from "@/features/auth/password-form";
import {
  environment,
  supabaseBrowserConfiguration,
} from "@/server/config/environment";

import styles from "@/features/auth/auth-panel.module.css";

export const dynamic = "force-dynamic";

export default function DefinePasswordPage() {
  const supabase = supabaseBrowserConfiguration(environment());
  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="password-title">
        {/* The public brand asset keeps the auth surface and email identity consistent. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Haz Que Vuelva"
          className={styles.brandLogo}
          height="65"
          src="https://hazquevuelva.site/images/brand/haz-que-vuelva-logo-heart-primary-v1.png"
          width="240"
        />
        <h1 className={styles.title} id="password-title">
          Crea tu contraseña
        </h1>
        <p className={styles.copy}>
          Usa al menos 12 caracteres con mayúsculas, minúsculas y números.
        </p>
        <PasswordForm supabase={supabase} />
      </section>
    </main>
  );
}
