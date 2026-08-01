import Link from "next/link";

import { LoginForm } from "@/features/auth/login-form";
import {
  environment,
  supabaseBrowserConfiguration,
} from "@/server/config/environment";

import styles from "@/features/auth/auth-panel.module.css";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const config = environment();
  const requested = (await searchParams).next;
  const nextPath =
    requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/";

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="login-title">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Haz Que Vuelva"
          className={styles.brandLogo}
          height="65"
          src="https://hazquevuelva.site/images/brand/haz-que-vuelva-logo-heart-primary-v1.png"
          width="240"
        />
        <h1 className={styles.title} id="login-title">
          Bienvenida
        </h1>
        <p className={styles.copy}>Entra con el correo usado en tu compra.</p>
        <LoginForm
          googleEnabled={config.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED}
          nextPath={nextPath}
          supabase={supabaseBrowserConfiguration(config)}
        />
        <Link className={styles.link} href="/auth/recuperar">
          ¿Olvidaste tu contraseña?
        </Link>
      </section>
    </main>
  );
}
