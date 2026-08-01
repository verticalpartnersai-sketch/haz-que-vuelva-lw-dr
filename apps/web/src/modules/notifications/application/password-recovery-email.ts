const BRAND_LOGO_URL =
  "https://hazquevuelva.site/images/brand/haz-que-vuelva-logo-heart-primary-v1.png";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function buildPasswordRecoveryEmail(actionUrl: string) {
  const safeActionUrl = escapeHtml(actionUrl);

  return {
    subject: "Restablece tu acceso a Haz Que Vuelva",
    text: [
      "Recupera tu acceso a Haz Que Vuelva.",
      "Recibimos una solicitud para crear una nueva contraseña.",
      `Usa este enlace seguro: ${actionUrl}`,
      "El enlace es personal, de un solo uso y caduca por seguridad.",
      "Si no solicitaste este cambio, ignora el mensaje. Tu contraseña seguirá siendo la misma.",
    ].join("\n\n"),
    html: `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>Restablece tu acceso a Haz Que Vuelva</title>
  </head>
  <body style="margin:0;padding:0;background:#050505;color:#f7f2ec;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Crea una nueva contraseña con tu enlace seguro y vuelve al área de miembros.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#050505;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;background:#111111;border:1px solid #2b2424;border-radius:20px;overflow:hidden;">
            <tr>
              <td align="center" style="padding:42px 28px 24px;">
                <img src="${BRAND_LOGO_URL}" width="250" alt="Haz Que Vuelva" style="display:block;width:250px;max-width:82%;height:auto;border:0;outline:none;text-decoration:none;">
              </td>
            </tr>
            <tr>
              <td style="padding:8px 36px 0;text-align:center;">
                <p style="margin:0 0 14px;color:#ef4444;font-size:12px;line-height:18px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Enlace seguro</p>
                <h1 style="margin:0;color:#fffaf5;font-size:30px;line-height:38px;font-weight:700;letter-spacing:-0.6px;">Recupera tu acceso</h1>
                <p style="margin:18px 0 0;color:#c9c1bc;font-size:16px;line-height:26px;">Recibimos una solicitud para crear una nueva contraseña en tu área de miembros.</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:30px 36px 12px;">
                <a href="${safeActionUrl}" style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;font-size:15px;line-height:20px;font-weight:800;letter-spacing:0.4px;border-radius:12px;padding:17px 28px;box-shadow:0 0 0 1px #ef4444,0 12px 28px rgba(220,38,38,.28);">RESTABLECER MI CONTRASEÑA</a>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 36px 34px;text-align:center;">
                <p style="margin:0;color:#8f8782;font-size:12px;line-height:19px;">El enlace es personal, de un solo uso y caduca por seguridad.</p>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #292323;padding:24px 36px 30px;text-align:center;">
                <p style="margin:0 0 10px;color:#a49b96;font-size:12px;line-height:18px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <p style="margin:0;word-break:break-all;color:#d5cdc8;font-size:11px;line-height:17px;"><a href="${safeActionUrl}" style="color:#d5cdc8;text-decoration:underline;">${safeActionUrl}</a></p>
                <p style="margin:22px 0 0;color:#726b67;font-size:11px;line-height:17px;">Si no solicitaste este cambio, ignora el mensaje. Tu contraseña seguirá siendo la misma.</p>
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0;color:#5f5955;font-size:11px;line-height:17px;">© Haz Que Vuelva · Área de miembros privada</p>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}
