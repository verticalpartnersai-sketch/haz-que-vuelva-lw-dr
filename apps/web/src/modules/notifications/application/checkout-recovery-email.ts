const BRAND_LOGO_URL =
  "https://hazquevuelva.site/images/brand/haz-que-vuelva-logo-heart-primary-v1.png";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

type RecoveryCopy = {
  subject: string;
  preview: string;
  eyebrow: string;
  headline: string;
  paragraphs: string[];
  cta: string;
};

const COPY_BY_STEP: Record<1 | 2 | 3, RecoveryCopy> = {
  1: {
    subject: "¿Se quedó a medias?",
    preview: "Tu acceso a Haz Que Vuelva sigue pendiente.",
    eyebrow: "Tu acceso quedó pendiente",
    headline: "Todavía puedes retomar tu protocolo",
    paragraphs: [
      "Puede haber sido una distracción, un problema con el pago o esa duda de último momento que aparece justo antes de decidir.",
      "Solo quiero recordarte por qué llegaste hasta aquí: dejar de improvisar cada vez que él se aleja y saber cuándo escribir, responder o esperar.",
      "Si todavía quieres seguir esa ruta, tu acceso a Haz Que Vuelva continúa disponible.",
    ],
    cta: "RETOMAR MI ACCESO",
  },
  2: {
    subject: "Antes de volver a abrir su chat",
    preview: "La ansiedad quiere alivio ahora. Tu caso necesita una decisión mejor.",
    eyebrow: "Lee esto antes de escribirle",
    headline: "Una frase distinta puede repetir el mismo error",
    paragraphs: [
      "Abres WhatsApp, relees la última conversación, escribes algo, lo borras y vuelves a empezar. En ese momento parece que necesitas encontrar las palabras perfectas.",
      "Pero la ansiedad no está buscando una buena decisión. Está buscando alivio. Y ahí vuelve el Bucle de Rechazo: silencio, urgencia, otro mensaje, más presión y después todavía más distancia.",
      "Haz Que Vuelva organiza los próximos siete días para que sepas qué frenar hoy, qué señal observar y cuál es el siguiente movimiento que tu situación realmente permite.",
    ],
    cta: "QUIERO DEJAR DE IMPROVISAR",
  },
  3: {
    subject: "Seguir improvisando también tiene un costo",
    preview: "El próximo silencio puede devolverte al mismo impulso.",
    eyebrow: "Último recordatorio",
    headline: "La próxima duda va a aparecer cuando vuelvas a mirar el teléfono",
    paragraphs: [
      "Quizá hoy consigas esperar. Después llega una historia, una respuesta fría, otro silencio o esa sensación de que él puede olvidarte, y todo vuelve a empezar.",
      "Haz Que Vuelva te entrega una ruta de siete días, una primera decisión para las próximas 24 horas y el árbol que te ayuda a elegir entre escribir, responder o esperar sin rogar, perseguirlo ni perderte intentando recuperarlo.",
      "El acceso cuesta US$7.90, es un pago único y tiene 7 días de garantía. No promete decidir lo que él hará. Te da claridad para dejar de empeorar lo que todavía puede tener una salida.",
    ],
    cta: "ACTIVAR MI PROTOCOLO — US$7.90",
  },
};

function renderHtml(copy: RecoveryCopy, checkoutUrl: string, unsubscribeUrl: string) {
  const safeCheckoutUrl = escapeHtml(checkoutUrl);
  const safeUnsubscribeUrl = escapeHtml(unsubscribeUrl);
  const paragraphs = copy.paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 18px;color:#d0c7c2;font-size:16px;line-height:27px;">${escapeHtml(paragraph)}</p>`,
    )
    .join("");

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>${escapeHtml(copy.subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#050505;color:#f7f2ec;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(copy.preview)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#050505;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;background:#111111;border:1px solid #2b2424;border-radius:20px;overflow:hidden;">
            <tr>
              <td align="center" style="padding:38px 28px 22px;">
                <img src="${BRAND_LOGO_URL}" width="238" alt="Haz Que Vuelva" style="display:block;width:238px;max-width:82%;height:auto;border:0;outline:none;text-decoration:none;">
              </td>
            </tr>
            <tr>
              <td style="padding:8px 36px 4px;">
                <p style="margin:0 0 13px;color:#ef4444;font-size:12px;line-height:18px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;">${escapeHtml(copy.eyebrow)}</p>
                <h1 style="margin:0 0 22px;color:#fffaf5;font-size:29px;line-height:37px;font-weight:700;letter-spacing:-0.5px;">${escapeHtml(copy.headline)}</h1>
                ${paragraphs}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:14px 36px 38px;">
                <a href="${safeCheckoutUrl}" style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;font-size:14px;line-height:20px;font-weight:800;letter-spacing:0.35px;border-radius:12px;padding:17px 24px;box-shadow:0 0 0 1px #ef4444,0 12px 28px rgba(220,38,38,.24);">${escapeHtml(copy.cta)}</a>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #292323;padding:22px 36px 28px;text-align:center;">
                <p style="margin:0 0 10px;color:#8f8782;font-size:11px;line-height:17px;">Recibiste este email porque iniciaste el checkout de Haz Que Vuelva y no se confirmó el pago.</p>
                <p style="margin:0;color:#706965;font-size:11px;line-height:17px;"><a href="${safeUnsubscribeUrl}" style="color:#8f8782;text-decoration:underline;">Darse de baja</a> de los recordatorios de checkout.</p>
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0;color:#5f5955;font-size:11px;line-height:17px;">© Haz Que Vuelva</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildCheckoutRecoveryEmail(input: {
  checkoutUrl: string;
  step: number;
  unsubscribeUrl: string;
}) {
  if (input.step !== 1 && input.step !== 2 && input.step !== 3) {
    throw new Error("invalid_checkout_recovery_step");
  }
  const copy = COPY_BY_STEP[input.step];
  return {
    subject: copy.subject,
    html: renderHtml(copy, input.checkoutUrl, input.unsubscribeUrl),
    text: [
      copy.headline,
      ...copy.paragraphs,
      copy.cta,
      input.checkoutUrl,
      "Darse de baja de los recordatorios de checkout:",
      input.unsubscribeUrl,
    ].join("\n\n"),
  };
}
