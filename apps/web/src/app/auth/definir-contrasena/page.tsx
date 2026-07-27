import { PasswordForm } from "@/features/auth/password-form";

import styles from "@/features/auth/auth-panel.module.css";

export default function DefinePasswordPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="password-title">
        <h1 className={styles.title} id="password-title">
          Crea tu contraseña
        </h1>
        <p className={styles.copy}>
          Usa al menos 12 caracteres con mayúsculas, minúsculas y números.
        </p>
        <PasswordForm />
      </section>
    </main>
  );
}
