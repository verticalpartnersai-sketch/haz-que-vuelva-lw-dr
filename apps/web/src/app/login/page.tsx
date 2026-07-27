import Link from "next/link";

import { LoginForm } from "@/features/auth/login-form";

import styles from "@/features/auth/auth-panel.module.css";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const requested = (await searchParams).next;
  const nextPath =
    requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/";

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="login-title">
        <h1 className={styles.title} id="login-title">
          Bienvenida
        </h1>
        <p className={styles.copy}>Entra con el correo usado en tu compra.</p>
        <LoginForm nextPath={nextPath} />
        <Link className={styles.link} href="/auth/recuperar">
          ¿Olvidaste tu contraseña?
        </Link>
      </section>
    </main>
  );
}
