import { z } from "zod";

import { createSupabaseServiceClient } from "@/server/supabase/service-client";

export const runtime = "nodejs";

const tokenSchema = z.uuid();

const headers = {
  "Cache-Control": "no-store",
  "Content-Type": "text/html; charset=utf-8",
} as const;

function page(success: boolean) {
  const title = success ? "Listo. Ya no recibirás estos recordatorios." : "Este enlace ya no es válido.";
  const detail = success
    ? "Tu baja de los emails de recuperación de checkout quedó registrada. Los emails esenciales de acceso y seguridad no cambian."
    : "No se hizo ningún cambio. Si ya te habías dado de baja, no necesitas hacer nada más.";
  return `<!doctype html>
<html lang="es">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Haz Que Vuelva</title></head>
  <body style="margin:0;background:#050505;color:#f7f2ec;font-family:Arial,Helvetica,sans-serif;display:grid;min-height:100vh;place-items:center;padding:24px;box-sizing:border-box;">
    <main style="width:100%;max-width:560px;background:#111;border:1px solid #2b2424;border-radius:20px;padding:38px;box-sizing:border-box;">
      <p style="margin:0 0 12px;color:#ef4444;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;">Haz Que Vuelva</p>
      <h1 style="margin:0 0 18px;font-size:30px;line-height:38px;">${title}</h1>
      <p style="margin:0;color:#cfc6c1;font-size:16px;line-height:27px;">${detail}</p>
    </main>
  </body>
</html>`;
}

function confirmationPage(token: string) {
  return `<!doctype html>
<html lang="es">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Haz Que Vuelva</title></head>
  <body style="margin:0;background:#050505;color:#f7f2ec;font-family:Arial,Helvetica,sans-serif;display:grid;min-height:100vh;place-items:center;padding:24px;box-sizing:border-box;">
    <main style="width:100%;max-width:560px;background:#111;border:1px solid #2b2424;border-radius:20px;padding:38px;box-sizing:border-box;">
      <p style="margin:0 0 12px;color:#ef4444;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;">Haz Que Vuelva</p>
      <h1 style="margin:0 0 18px;font-size:30px;line-height:38px;">¿Quieres dejar de recibir estos recordatorios?</h1>
      <p style="margin:0 0 24px;color:#cfc6c1;font-size:16px;line-height:27px;">Esto no afectará los emails esenciales de acceso, seguridad o soporte.</p>
      <form method="post" action="?token=${token}"><button type="submit" style="border:0;border-radius:12px;background:#ef4444;color:white;font-weight:700;padding:14px 20px;cursor:pointer;">CONFIRMAR BAJA</button></form>
    </main>
  </body>
</html>`;
}

async function unsubscribe(request: Request) {
  const token = tokenSchema.safeParse(new URL(request.url).searchParams.get("token"));
  if (!token.success) {
    return new Response(page(false), { headers, status: 400 });
  }

  const client = createSupabaseServiceClient();
  const { data, error } = await client.rpc("unsubscribe_checkout_recovery", {
    p_token: token.data,
  });
  if (error) {
    return new Response(page(false), { headers, status: 503 });
  }
  return new Response(page(data === true), { headers, status: 200 });
}

export async function GET(request: Request) {
  const token = tokenSchema.safeParse(new URL(request.url).searchParams.get("token"));
  if (!token.success) {
    return new Response(page(false), { headers, status: 400 });
  }
  return new Response(confirmationPage(token.data), { headers, status: 200 });
}

export async function POST(request: Request) {
  return unsubscribe(request);
}
