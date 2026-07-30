import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const marketingDir = join(scriptDir, "..");
const assetDir = join(
  marketingDir,
  "public",
  "images",
  "quiz",
  "sales-proof",
);
const wallpaperPath = join(
  marketingDir,
  "public",
  "images",
  "quiz",
  "proof-preview",
  "whatsapp-chat-wallpaper.webp",
);
const chromeBinary =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const stories = [
  {
    id: "route-gray",
    photoPosition: "50% 36%",
    result: "unblock",
    messages: [
      ["Creí que si dejaba de insistir me iba a olvidar por completo.", "18:42"],
      [
        "Seguí la ruta aunque me costó muchísimo no buscarlo desde otra cuenta.",
        "18:43",
      ],
      [
        "Cinco días después me desbloqueó y fue él quien preguntó si estaba bien.",
        "18:45",
      ],
      [
        "No corrí a explicarme. Respondí como indicaba mi protocolo y ahora vuelve a escribirme sin que yo lo persiga.",
        "18:47",
      ],
    ],
  },
  {
    id: "route-yellow",
    photoPosition: "50% 38%",
    result: "contact",
    messages: [
      [
        "Dejé de convertir cada respuesta corta en una conversación eterna.",
        "21:06",
      ],
      ["Respondí con la misma energía y cerré el chat sin pedir nada.", "21:07"],
      [
        "Tres días después apareció él con un mensaje que no esperaba.",
        "21:09",
      ],
      [
        "Me dijo que mi ausencia le había dado vueltas en la cabeza. Por fin no soy yo quien empuja todo el tiempo.",
        "21:11",
      ],
    ],
  },
  {
    id: "route-green",
    photoPosition: "50% 34%",
    result: "meeting",
    messages: [
      [
        "Cuando volvió con un “hola” casi arruino todo queriendo hablar de la relación.",
        "09:14",
      ],
      [
        "Apliqué mi ruta, mantuve la calma y dejé que el contacto respirara.",
        "09:15",
      ],
      [
        "Al día siguiente retomó la conversación por iniciativa propia.",
        "09:17",
      ],
      [
        "Esta semana nos vimos. Sentí que se acercaba porque quería, no porque yo lo presionaba.",
        "09:19",
      ],
    ],
  },
  {
    id: "route-third-person",
    photoPosition: "50% 34%",
    result: "meeting",
    messages: [
      ["Pensaba que tenía que competir con ella para que me eligiera.", "22:28"],
      [
        "Dejé de mirar sus historias y de publicar indirectas para provocarlo.",
        "22:29",
      ],
      ["Cuando salí de ese juego, él empezó a buscar señales mías.", "22:31"],
      [
        "Ayer pidió verme y habló de nosotros. Yo ya no estaba intentando convencerlo de nada.",
        "22:33",
      ],
    ],
  },
  {
    id: "route-logistics",
    photoPosition: "50% 32%",
    result: "contact",
    messages: [
      [
        "Solo hablábamos de pendientes y yo usaba cualquier excusa para alargar el chat.",
        "16:02",
      ],
      [
        "Seguí la decisión exacta de mi ruta y dejé de convertir obligación en presión.",
        "16:04",
      ],
      [
        "Cuatro días después escribió por algo que no tenía nada que ver con trabajo ni dinero.",
        "16:06",
      ],
      [
        "Terminó invitándome a tomar un café. Hacía meses que algo así no nacía de él.",
        "16:08",
      ],
    ],
  },
  {
    id: "route-red",
    photoPosition: "50% 35%",
    result: "unblock",
    messages: [
      [
        "Me pidió espacio y yo seguía buscando una forma de hacerlo cambiar de idea.",
        "11:36",
      ],
      [
        "El protocolo me hizo parar de verdad y recuperar el control sobre mí.",
        "11:38",
      ],
      ["No crucé ningún límite ni volví a insistir.", "11:39"],
      [
        "Semanas después quitó el bloqueo y volvió a escribir. Esta vez respondí sin repetir el mismo caos.",
        "11:42",
      ],
    ],
  },
  {
    id: "universal",
    photoPosition: "50% 30%",
    result: "returned",
    messages: [
      [
        "Hoy puedo decirte algo que hace un mes me parecía imposible.",
        "20:51",
      ],
      [
        "Dejé de reaccionar como él esperaba y cumplí los siete días completos.",
        "20:52",
      ],
      [
        "Él rompió el silencio, pidió hablar y reconoció que seguía pensando en mí.",
        "20:54",
      ],
      [
        "Volvimos, pero lo más importante es que ya no necesito perderme para que alguien me elija.",
        "20:56",
      ],
    ],
  },
];

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

function chatHtml(story, photoDataUrl, wallpaperDataUrl) {
  const messageMarkup = story.messages
    .map(
      ([message, time], index) => `
        <div class="message${index === 0 ? " message--first" : ""}">
          <span class="message__copy">${escapeHtml(message)}</span>
          <span class="message__time">${time}</span>
        </div>
        ${
          index === 2
            ? `
              <div class="photo-message">
                <img alt="" src="${photoDataUrl}" />
                <span class="photo-message__time">${time}</span>
                <span class="forward-action" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M15.6 5.3 22 11.7l-6.4 6.4v-4.2C10.8 14 7.5 15.5 5 18.7c.8-5.8 4.1-9 10.6-9.2V5.3Z" />
                  </svg>
                </span>
              </div>
            `
            : ""
        }
      `,
    )
    .join("");

  return `<!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          html, body {
            height: 100%;
            margin: 0;
            overflow: hidden;
            width: 100%;
          }
          body {
            background: #0b141a;
            color: #e9edef;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            padding: 15px 16px 18px;
            position: relative;
          }
          body::before {
            background-image: url("${wallpaperDataUrl}");
            background-position: top left;
            background-repeat: repeat;
            background-size: 270px 480px;
            content: "";
            filter: grayscale(1) brightness(1.28);
            inset: 0;
            opacity: .075;
            pointer-events: none;
            position: absolute;
          }
          .conversation {
            align-items: flex-start;
            display: flex;
            flex-direction: column;
            gap: 4px;
            position: relative;
            width: 100%;
            z-index: 1;
          }
          .message {
            background: #202c33;
            border-radius: 8px;
            box-shadow: 0 1px .5px rgba(11, 20, 26, .34);
            font-size: 20px;
            line-height: 1.29;
            max-width: 91%;
            padding: 8px 10px 7px;
            position: relative;
            width: fit-content;
          }
          .message--first::before {
            border-bottom: 9px solid transparent;
            border-right: 10px solid #202c33;
            content: "";
            left: -8px;
            position: absolute;
            top: 0;
          }
          .message__time {
            color: #8696a0;
            float: right;
            font-size: 12px;
            line-height: 1;
            margin-left: 16px;
            padding-top: 11px;
            transform: translateY(2px);
          }
          .photo-message {
            background: #202c33;
            border-radius: 8px;
            box-shadow: 0 1px .5px rgba(11, 20, 26, .34);
            margin-top: 1px;
            max-width: 76%;
            overflow: visible;
            padding: 4px;
            position: relative;
            width: 500px;
          }
          .photo-message img {
            border-radius: 6px;
            display: block;
            height: 540px;
            object-fit: cover;
            object-position: ${story.photoPosition};
            width: 100%;
          }
          .photo-message__time {
            background: rgba(11, 20, 26, .55);
            border-radius: 8px;
            bottom: 11px;
            color: #e9edef;
            font-size: 12px;
            line-height: 1;
            padding: 4px 6px;
            position: absolute;
            right: 11px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, .82);
          }
          .forward-action {
            align-items: center;
            background: rgba(78, 87, 92, .92);
            border-radius: 999px;
            display: flex;
            height: 42px;
            justify-content: center;
            position: absolute;
            right: -54px;
            top: 47%;
            width: 42px;
          }
          .forward-action svg {
            fill: #e9edef;
            height: 23px;
            width: 23px;
          }
        </style>
      </head>
      <body>
        <main class="conversation">${messageMarkup}</main>
      </body>
    </html>`;
}

async function main() {
  const temporaryDir = await mkdtemp(join(tmpdir(), "haz-que-vuelva-sales-chat-"));
  const wallpaper = await readFile(wallpaperPath);
  const wallpaperDataUrl = `data:image/webp;base64,${wallpaper.toString("base64")}`;

  try {
    for (const story of stories) {
      const photo = await readFile(join(assetDir, `${story.id}.webp`));
      const photoDataUrl = `data:image/webp;base64,${photo.toString("base64")}`;
      const htmlPath = join(temporaryDir, `${story.id}.html`);
      const pngPath = join(temporaryDir, `${story.id}.png`);
      const outputPath = join(assetDir, `${story.id}-chat.webp`);

      await writeFile(
        htmlPath,
        chatHtml(story, photoDataUrl, wallpaperDataUrl),
        "utf8",
      );
      execFileSync(chromeBinary, [
        "--headless=new",
        "--disable-gpu",
        "--force-device-scale-factor=1",
        "--hide-scrollbars",
        "--run-all-compositor-stages-before-draw",
        "--window-size=672,880",
        `--screenshot=${pngPath}`,
        `file://${htmlPath}`,
      ]);

      await sharp(pngPath)
        .resize(672, 880, { fit: "fill" })
        .webp({
          alphaQuality: 86,
          effort: 6,
          quality: 78,
          smartSubsample: true,
        })
        .toFile(outputPath);
    }
  } finally {
    await rm(temporaryDir, { force: true, recursive: true });
  }
}

await main();
