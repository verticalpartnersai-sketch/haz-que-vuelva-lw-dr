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
  "proof-preview",
);
const chromeBinary =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const stories = [
  {
    id: "camila",
    photo: "camila-v2.webp",
    photoPosition: "50% 45%",
    messages: [
      ["No tienes idea de lo que pasó.", "12:12"],
      [
        "Seguí la ruta y dejé de buscarlo por otras cuentas, aunque sentía que iba a explotar.",
        "12:14",
      ],
      [
        "Al sexto día me desbloqueó y me preguntó por qué había desaparecido.",
        "12:18",
      ],
      [
        "Por primera vez no respondí desde el miedo. Hice exactamente lo que indicaba el protocolo y ahora volvemos a hablar sin que yo tenga que perseguirlo.",
        "12:21",
      ],
    ],
  },
  {
    id: "valentina",
    photo: "valentina-v2.webp",
    photoPosition: "50% 42%",
    messages: [
      [
        "Yo pensaba que si dejaba de competir iba a perderlo definitivamente.",
        "10:07",
      ],
      [
        "El protocolo me hizo separar lo que sabía de todo lo que estaba imaginando.",
        "10:08",
      ],
      [
        "Dejé las indirectas y seguí mi ruta durante los 7 días.",
        "10:09",
      ],
      [
        "Ayer él volvió a buscarme y me pidió que habláramos en persona. Esta vez no sentí que necesitaba convencerlo de nada.",
        "10:10",
      ],
    ],
  },
  {
    id: "sofia",
    photo: "sofia-v2.webp",
    photoPosition: "50% 42%",
    messages: [
      [
        "Antes sentía que cada respuesta suya era mi última oportunidad.",
        "19:38",
      ],
      [
        "Esta vez igualé su intensidad, respondí sin presión y cerré la conversación como decía mi ruta.",
        "19:39",
      ],
      ["Al día siguiente fue él quien volvió a escribirme.", "19:40"],
      [
        "Hoy me dijo que siente que estoy diferente y que quiere vernos. No puedo creer cuánto estaba alejándolo por ansiedad.",
        "19:41",
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
            background-color: #0b141a;
            color: #e9edef;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            padding: 18px 16px 26px;
            position: relative;
          }
          body::before {
            background-image: url("${wallpaperDataUrl}");
            background-position: top left;
            background-repeat: repeat;
            background-size: 270px 480px;
            content: "";
            filter: grayscale(1) brightness(1.35);
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
            font-size: 21px;
            line-height: 1.32;
            max-width: 89%;
            padding: 9px 11px 7px;
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
            font-size: 13px;
            line-height: 1;
            margin-left: 18px;
            padding-top: 12px;
            transform: translateY(2px);
          }
          .photo-message {
            background: #202c33;
            border-radius: 8px;
            box-shadow: 0 1px .5px rgba(11, 20, 26, .34);
            margin-top: 1px;
            max-width: 78%;
            overflow: visible;
            padding: 4px;
            position: relative;
            width: 510px;
          }
          .photo-message img {
            border-radius: 6px;
            display: block;
            height: 500px;
            object-fit: cover;
            object-position: ${story.photoPosition};
            width: 100%;
          }
          .photo-message__time {
            background: rgba(11, 20, 26, .55);
            border-radius: 8px;
            bottom: 12px;
            color: #e9edef;
            font-size: 13px;
            line-height: 1;
            padding: 4px 6px;
            position: absolute;
            right: 12px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, .82);
          }
          .forward-action {
            align-items: center;
            background: rgba(78, 87, 92, .92);
            border-radius: 999px;
            display: flex;
            height: 46px;
            justify-content: center;
            position: absolute;
            right: -58px;
            top: 48%;
            width: 46px;
          }
          .forward-action svg {
            fill: #e9edef;
            height: 25px;
            width: 25px;
          }
        </style>
      </head>
      <body>
        <main class="conversation">${messageMarkup}</main>
      </body>
    </html>`;
}

async function main() {
  const temporaryDir = await mkdtemp(join(tmpdir(), "haz-que-vuelva-chat-"));
  const wallpaper = await readFile(join(assetDir, "whatsapp-chat-wallpaper.webp"));
  const wallpaperDataUrl = `data:image/webp;base64,${wallpaper.toString("base64")}`;

  try {
    for (const story of stories) {
      const photo = await readFile(join(assetDir, story.photo));
      const photoDataUrl = `data:image/webp;base64,${photo.toString("base64")}`;
      const htmlPath = join(temporaryDir, `${story.id}.html`);
      const pngPath = join(temporaryDir, `${story.id}.png`);
      const outputPath = join(assetDir, `${story.id}-chat-v3.webp`);

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
          quality: 80,
          smartSubsample: true,
        })
        .toFile(outputPath);
    }
  } finally {
    await rm(temporaryDir, { force: true, recursive: true });
  }
}

await main();
