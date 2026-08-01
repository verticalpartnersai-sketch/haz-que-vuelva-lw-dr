import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

import { PdfLibContentInspector } from "../src/modules/content/adapters/pdf-lib-content-inspector.ts";
import { resolveUnicodePath } from "./resolve-unicode-path.mjs";

const PRODUCTION_PROJECT_REF = "euaurfmlxornllntwmmh";
const DEFAULT_ROOT = path.join(
  process.env.HOME ?? "",
  "Documents/Obsidian Vault/ORACLE/VERTICAL PARTNERS/Operação LW DR",
  "Operação 01 - Documentação/4. Produtos e Entregáveis/Produtos",
);
const entries = [
  {
    code: "haz_que_vuelva",
    file: "00. Produto FRONT/01_Haz_Que_Vuelva_Protocolo_7_Dias_WEB_FINAL.pdf",
    pages: 43,
    bytes: 1_429_773,
    sha256: "e6753c7f97e832cd7f073bc6fd959c89eb69633302495fdc4c880cd7816e5989",
  },
  {
    code: "21_mensajes",
    file: "01. Produto ORDER-BUMP/02_21_Mensajes_de_Reconexion_WEB_FINAL.pdf",
    pages: 29,
    bytes: 844_698,
    sha256: "5b86d14365fdb4f59899041d425cca845a7093db23b62a98b6a13a171faad1e9",
  },
  {
    code: "la_otra",
    file: "01. Produto ORDER-BUMP/03_La_Otra_Plan_de_Reconquista_WEB_FINAL.pdf",
    pages: 22,
    bytes: 950_597,
    sha256: "493c18914f4e9a601b06e52be76d86106b6bca9327da81bf201374c765e5b22d",
  },
  {
    code: "reconquista_30",
    file: "02. Produto UPSELL/04_Reconquista_30_WEB_FINAL.pdf",
    pages: 50,
    bytes: 1_539_255,
    sha256: "58730b9dd580cf7e4ed296fcf0fb6af922973d3973373ac0371bb5aeaf044322",
  },
];

if (process.argv.includes("--help")) {
  console.log("Usage: npm run content:preflight -- [content-root] [--remote]");
  process.exit(0);
}

const requestedRoot = process.argv.find(
  (argument) =>
    !argument.startsWith("--") &&
    argument !== process.argv[0] &&
    argument !== process.argv[1],
);
const root = path.resolve(requestedRoot ?? DEFAULT_ROOT);
const inspector = new PdfLibContentInspector();
const local = [];

for (const entry of entries) {
  let filePath;
  let metadata;
  let buffer;
  try {
    filePath = await resolveUnicodePath(root, entry.file);
    [metadata, buffer] = await Promise.all([stat(filePath), readFile(filePath)]);
  } catch {
    console.error(`Content preflight failed: ${entry.code} file is unavailable`);
    process.exit(1);
  }

  const digest = createHash("sha256").update(buffer).digest("hex");
  let pageCount;
  try {
    pageCount = (await inspector.inspect(new Uint8Array(buffer))).pageCount;
  } catch {
    console.error(`Content preflight failed: ${entry.code} is not a valid PDF`);
    process.exit(1);
  }
  if (
    metadata.size !== entry.bytes ||
    digest !== entry.sha256 ||
    pageCount !== entry.pages
  ) {
    console.error(`Content preflight failed: ${entry.code} differs from the approved manifest`);
    process.exit(1);
  }
  local.push({ code: entry.code, bytes: metadata.size, pages: pageCount, sha256: digest });
}

console.log(JSON.stringify({ local }, null, 2));
if (!process.argv.includes("--remote")) process.exit(0);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error("Content preflight failed: Supabase admin environment is unavailable");
  process.exit(1);
}
if (new URL(url).hostname !== `${PRODUCTION_PROJECT_REF}.supabase.co`) {
  console.error("Content preflight failed: remote target is not HQV production");
  process.exit(1);
}

const client = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const remote = [];
for (const entry of entries) {
  const [{ data: product, error: productError }, { count, error: contentError }] =
    await Promise.all([
      client.from("products").select("code,active").eq("code", entry.code).maybeSingle(),
      client
        .from("content_items")
        .select("id", { count: "exact", head: true })
        .eq("product_code", entry.code),
    ]);
  if (productError || contentError || !product?.active) {
    console.error(`Content preflight failed: ${entry.code} remote catalog is unavailable`);
    process.exit(1);
  }
  remote.push({ code: entry.code, active: true, publishedContentItems: count ?? 0 });
}
console.log(JSON.stringify({ remote }, null, 2));
