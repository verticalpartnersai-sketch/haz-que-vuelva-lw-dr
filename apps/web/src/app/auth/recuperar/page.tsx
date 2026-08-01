import Link from "next/link";

import { RecoveryForm } from "@/features/auth/recovery-form";

import styles from "@/features/auth/auth-panel.module.css";

export const dynamic = "force-dynamic";

export default function RecoverPasswordPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="recovery-title">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Haz Que Vuelva"
          className={styles.brandLogo}
          height="65"
          src="https://hazquevuelva.site/images/brand/haz-que-vuelva-logo-heart-primary-v1.png"
          width="240"
        />
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
