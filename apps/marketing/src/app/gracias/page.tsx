import type { Metadata } from "next";
import Image from "next/image";

import { Icon } from "@/components/icon";
import { PostPurchaseFooter } from "@/features/upsells/postpurchase-chrome";

export const metadata: Metadata = {
  title: "Instrucciones de acceso",
  description: "Próximos pasos para acceder a Haz Que Vuelva.",
  robots: { follow: false, index: false },
};

export default function Page() {
  return (
    <main className="thanks-page">
      <a className="pp-skip-link" href="#instrucciones-de-acceso">
        Ir a las instrucciones de acceso
      </a>

      <section className="thanks-page__hero">
        <Image
          alt="Haz Que Vuelva"
          className="thanks-page__logo"
          height={392}
          priority
          src="/images/brand/haz-que-vuelva-logo-heart-primary-v1.webp"
          width={1451}
        />
        <span className="thanks-page__status">
          <Icon name="check" weight="bold" />
          Compra principal confirmada
        </span>
        <p className="thanks-page__eyebrow">Ya terminaste este paso</p>
        <h1>Tu acceso a Haz Que Vuelva está en camino.</h1>
        <p className="thanks-page__lead">
          Revisa el email que usaste en el checkout. Allí recibirás la
          invitación personal para crear tu contraseña y entrar al área de
          miembros.
        </p>
        <aside className="thanks-page__notice">
          <span aria-hidden="true"><Icon name="spark" weight="fill" /></span>
          <div>
            <strong>Busca el email de Haz Que Vuelva</strong>
            <p>
              Puede tardar algunos minutos. Revisa también spam, promociones y
              correo no deseado.
            </p>
          </div>
        </aside>
      </section>

      <section className="thanks-page__steps" id="instrucciones-de-acceso">
        <header>
          <span>Próximos pasos</span>
          <h2>Haz esto para entrar sin perder tiempo.</h2>
        </header>
        <ol>
          <li>
            <span>01</span>
            <div>
              <h3>Abre el email de acceso</h3>
              <p>Busca el mensaje enviado por Haz Que Vuelva.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Crea una contraseña segura</h3>
              <p>El enlace es personal. No lo compartas con otra persona.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Empieza por tu ruta principal</h3>
              <p>Antes de enviar otro mensaje, abre Haz Que Vuelva y ejecuta la primera decisión.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="thanks-page__access">
        <span>Acceso privado</span>
        <h2>Cuando tu invitación llegue, todo estará listo.</h2>
        <p>
          Si ya creaste tu contraseña, puedes entrar directamente. Si todavía
          no recibiste el email, espera unos minutos antes de intentarlo.
        </p>
        <a className="offer-cta thanks-page__cta" href="https://miembros.hazquevuelva.site/login">
          Entrar al área de miembros
          <Icon name="arrowRight" weight="bold" />
        </a>
        <small>Tu acceso depende de la confirmación del pago en el checkout.</small>
      </section>

      <PostPurchaseFooter />
    </main>
  );
}
