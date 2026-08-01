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

export default async function MfaPage() {
  try {
    await currentIdentity();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      redirect("/login?next=/auth/mfa");
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
          Añade una segunda verificación opcional para impedir accesos aunque tu
          contraseña sea expuesta.
        </p>
        <MfaManager supabase={supabaseBrowserConfiguration(environment())} />
      </section>
    </main>
  );
}
