import { PasswordForm } from "@/features/auth/password-form";
import {
  environment,
  supabaseBrowserConfiguration,
} from "@/server/config/environment";

import styles from "@/features/auth/auth-panel.module.css";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  const supabase = supabaseBrowserConfiguration(environment());
  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="reset-title">
        <h1 className={styles.title} id="reset-title">
          Nueva contraseña
        </h1>
        <p className={styles.copy}>
          Usa al menos 12 caracteres con mayúsculas, minúsculas y números.
        </p>
        <PasswordForm mode="reset" supabase={supabase} />
      </section>
    </main>
  );
}
