import Link from "next/link";

import { RecoveryForm } from "@/features/auth/recovery-form";

import styles from "@/features/auth/auth-panel.module.css";

export default function RecoverPasswordPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="recovery-title">
        <h1 className={styles.title} id="recovery-title">
          Recupera tu acceso
        </h1>
        <p className={styles.copy}>
          Te enviaremos un enlace de un solo uso si el correo está registrado.
        </p>
        <RecoveryForm />
        <Link className={styles.link} href="/login">
          Volver al inicio de sesión
        </Link>
      </section>
    </main>
  );
}
