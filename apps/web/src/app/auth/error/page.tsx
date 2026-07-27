import styles from "@/features/auth/auth-panel.module.css";

export default function AuthErrorPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="auth-error-title">
        <h1 className={styles.title} id="auth-error-title">
          Enlace no válido
        </h1>
        <p className={styles.message}>
          El enlace expiró o ya fue utilizado. Solicita un nuevo acceso al
          soporte.
        </p>
      </section>
    </main>
  );
}
