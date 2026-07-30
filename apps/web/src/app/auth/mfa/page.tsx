import { redirect } from "next/navigation";

import styles from "@/features/auth/auth-panel.module.css";
import { MfaManager } from "@/features/auth/mfa-manager";
import {
  AuthenticationRequiredError,
  currentIdentity,
} from "@/modules/identity/application/current-identity";
import {
  environment,
  supabaseBrowserConfiguration,
} from "@/server/config/environment";

type MfaPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function MfaPage({ searchParams }: MfaPageProps) {
  const requested = (await searchParams).next;
  const nextPath =
    requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/";
  let identity;
  try {
    identity = await currentIdentity();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      const mfaPath = `/auth/mfa?next=${encodeURIComponent(nextPath)}`;
      redirect(`/login?next=${encodeURIComponent(mfaPath)}`);
    }
    throw error;
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="mfa-title">
        <h1 className={styles.title} id="mfa-title">
          Protege tu cuenta
        </h1>
        <p className={styles.copy}>
          {identity.role === "admin"
            ? "La administración exige un segundo factor antes de abrir datos o ejecutar cambios sensibles."
            : "Añade una segunda verificación para impedir accesos aunque tu contraseña sea expuesta."}
        </p>
        <MfaManager
          adminRequired={identity.role === "admin"}
          nextPath={nextPath}
          supabase={supabaseBrowserConfiguration(environment())}
        />
      </section>
    </main>
  );
}
