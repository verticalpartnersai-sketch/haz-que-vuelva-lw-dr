import type { Metadata } from "next";
import Image from "next/image";

import { Icon } from "@/components/icon";

export const metadata: Metadata = {
  title: "Instrucciones de acceso",
  description: "Próximos pasos para acceder a Haz Que Vuelva.",
  robots: { follow: false, index: false },
};

export default function Page() {
  return (
    <main className="thanks-page">
      <Image
        alt="Haz Que Vuelva"
        height={392}
        priority
        src="/images/brand/haz-que-vuelva-logo-heart-primary-v1.webp"
        width={1451}
      />
      <span className="thanks-page__status">
        <Icon name="spark" weight="bold" />
        Verifica el estado de tu pago
      </span>
      <h1>Si tu pago fue aprobado, tu acceso ya está siendo preparado.</h1>
      <p>
        Revisa el email usado en el checkout. Cuando la aprobación llegue,
        recibirás la invitación para definir tu contraseña y entrar al área de
        miembros.
      </p>
      <div className="thanks-page__steps">
        <article>
          <span>1</span>
          <div>
            <h2>Abre el email de acceso</h2>
            <p>
              Busca el mensaje de Haz Que Vuelva y revisa también las carpetas
              de spam o promociones.
            </p>
          </div>
        </article>
        <article>
          <span>2</span>
          <div>
            <h2>Define una contraseña segura</h2>
            <p>
              El enlace es personal. No lo compartas ni uses el acceso de otra
              persona.
            </p>
          </div>
        </article>
        <article>
          <span>3</span>
          <div>
            <h2>Empieza por Haz Que Vuelva</h2>
            <p>
              Antes de enviar otro mensaje, abre tu ruta principal y ejecuta la
              primera decisión.
            </p>
          </div>
        </article>
      </div>
      <a
        className="offer-cta"
        href="https://miembros.hazquevuelva.site/login"
      >
        ENTRAR AL ÁREA DE MIEMBROS
        <Icon name="arrowRight" weight="bold" />
      </a>
      <small>
        Si el email todavía no llegó, espera unos minutos y confirma que el
        pago fue aprobado.
      </small>
    </main>
  );
}
