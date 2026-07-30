import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { PDFDocument } from "pdf-lib";

import {
  ContentPdfCleanupError,
  ContentPdfValidationError,
  publishContentPdf,
  type ContentPdfInspector,
  type PrivateContentPublisher,
} from "../src/modules/content/application/publish-content-pdf.ts";
import {
  AdminReauthenticationError,
  createAdminReauthenticationToken,
  hashAdminReauthenticationToken,
  isAdminReauthenticationToken,
  verifyAdminPassword,
  type PasswordVerifier,
} from "../src/modules/identity/application/admin-reauthentication.ts";

const REAUTH_TOKEN_HASH = "a".repeat(64);

class FakeInspector implements ContentPdfInspector {
  pageCount = 1;
  calls = 0;

  async inspect() {
    this.calls += 1;
    return { pageCount: this.pageCount };
  }
}

class FakePublisher implements PrivateContentPublisher {
  cleanupFails = false;
  persistFails = false;
  persisted: Array<{
    path: string;
    sha256: string;
    sizeBytes: number;
  }> = [];
  removed: string[] = [];
  uploaded: string[] = [];

  async upload(input: { path: string }) {
    this.uploaded.push(input.path);
  }

  async persist(input: { path: string; sha256: string; sizeBytes: number }) {
    if (this.persistFails) throw new Error("persist_failed");
    this.persisted.push(input);
    return {
      contentFileId: "file-1",
      contentItemId: "item-1",
      version: 2,
    };
  }

  async remove(_bucket: string, path: string) {
    if (this.cleanupFails) throw new Error("cleanup_failed");
    this.removed.push(path);
  }
}

async function validPdf() {
  const document = await PDFDocument.create();
  document.addPage([612, 792]);
  return new Uint8Array(await document.save());
}

test("publica un PDF validado con hash y ruta interna aleatoria", async () => {
  const inspector = new FakeInspector();
  const publisher = new FakePublisher();
  const bytes = await validPdf();

  const result = await publishContentPdf({
    bytes,
    contentType: "application/pdf",
    inspector,
    productCode: "haz_que_vuelva",
    publisher,
    reauthenticationTokenHash: REAUTH_TOKEN_HASH,
    title: "  Guía principal  ",
  });

  assert.deepEqual(result, {
    contentFileId: "file-1",
    contentItemId: "item-1",
    pageCount: 1,
    version: 2,
  });
  assert.equal(inspector.calls, 1);
  assert.match(
    publisher.uploaded[0],
    /^products\/haz_que_vuelva\/[0-9a-f-]{36}\.pdf$/,
  );
  assert.match(publisher.persisted[0].sha256, /^[0-9a-f]{64}$/);
  assert.equal(publisher.persisted[0].sizeBytes, bytes.byteLength);
});

test("rechaza MIME o firma falsos antes de tocar storage", async () => {
  const publisher = new FakePublisher();

  await assert.rejects(
    publishContentPdf({
      bytes: new TextEncoder().encode("not-a-pdf"),
      contentType: "application/octet-stream",
      inspector: new FakeInspector(),
      productCode: "haz_que_vuelva",
      publisher,
      reauthenticationTokenHash: REAUTH_TOKEN_HASH,
      title: "Guía principal",
    }),
    ContentPdfValidationError,
  );
  assert.deepEqual(publisher.uploaded, []);
});

test("rechaza documentos que exceden el límite de páginas", async () => {
  const inspector = new FakeInspector();
  inspector.pageCount = 301;
  const publisher = new FakePublisher();

  await assert.rejects(
    publishContentPdf({
      bytes: await validPdf(),
      contentType: "application/pdf",
      inspector,
      productCode: "haz_que_vuelva",
      publisher,
      reauthenticationTokenHash: REAUTH_TOKEN_HASH,
      title: "Guía principal",
    }),
    /source_pdf_page_count_out_of_bounds/,
  );
  assert.deepEqual(publisher.uploaded, []);
});

test("elimina el objeto si la transacción de metadatos falla", async () => {
  const publisher = new FakePublisher();
  publisher.persistFails = true;

  await assert.rejects(
    publishContentPdf({
      bytes: await validPdf(),
      contentType: "application/pdf",
      inspector: new FakeInspector(),
      productCode: "haz_que_vuelva",
      publisher,
      reauthenticationTokenHash: REAUTH_TOKEN_HASH,
      title: "Guía principal",
    }),
    /persist_failed/,
  );
  assert.deepEqual(publisher.removed, publisher.uploaded);
});

test("una limpieza fallida se eleva como incidente operativo", async () => {
  const publisher = new FakePublisher();
  publisher.persistFails = true;
  publisher.cleanupFails = true;

  await assert.rejects(
    publishContentPdf({
      bytes: await validPdf(),
      contentType: "application/pdf",
      inspector: new FakeInspector(),
      productCode: "haz_que_vuelva",
      publisher,
      reauthenticationTokenHash: REAUTH_TOKEN_HASH,
      title: "Guía principal",
    }),
    ContentPdfCleanupError,
  );
});

test("la ruta exige feature, origen y rol admin antes de usar el cliente servidor", () => {
  const route = readFileSync(
    new URL("../src/app/api/admin/content/pdfs/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(route, /FEATURE_ADMIN/);
  assert.match(route, /FEATURE_CONTENT/);
  assert.match(route, /isSameOriginMutation/);
  assert.match(route, /await requireAdmin\(\)/);
  assert.match(route, /createSupabaseServiceClient/);
  assert.match(
    route,
    /new SupabasePrivateContentPublisher\([\s\S]*metadataClient,[\s\S]*storageClient/,
  );
});

test("la RPC valida límites, audita y no está expuesta a anónimos", () => {
  const migration = readFileSync(
    new URL(
      "../../../supabase/migrations/202607300014_admin_content_publish.sql",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(migration, /if not public\.is_admin\(\)/);
  assert.match(migration, /p_size_bytes > 12582912/);
  assert.match(migration, /content\.pdf_published/);
  assert.match(migration, /revoke all[\s\S]*from public, anon/);
});

test("genera una credencial de reautenticación aleatoria y almacenable solo como hash", async () => {
  const token = createAdminReauthenticationToken();
  assert.equal(isAdminReauthenticationToken(token), true);
  assert.equal(token.length, 43);
  assert.match(await hashAdminReauthenticationToken(token), /^[0-9a-f]{64}$/);
  await assert.rejects(
    hashAdminReauthenticationToken("token-predecible"),
    AdminReauthenticationError,
  );
});

test("la prueba de contraseña falla cerrada", async () => {
  class FakePasswordVerifier implements PasswordVerifier {
    private readonly accepted: boolean;

    constructor(accepted: boolean) {
      this.accepted = accepted;
    }

    async verify() {
      return this.accepted;
    }
  }

  await verifyAdminPassword({
    email: "admin@example.com",
    password: "correcta",
    verifier: new FakePasswordVerifier(true),
  });
  await assert.rejects(
    verifyAdminPassword({
      email: "admin@example.com",
      password: "incorrecta",
      verifier: new FakePasswordVerifier(false),
    }),
    AdminReauthenticationError,
  );
});

test("la reautenticación es corta, de uso único y no puede iniciarse con la sesión admin", () => {
  const migration = readFileSync(
    new URL(
      "../../../supabase/migrations/202607300015_admin_reauthentication.sql",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(migration, /auth\.role\(\) <> 'service_role'/);
  assert.match(migration, /now\(\) \+ interval '5 minutes'/);
  assert.match(
    migration,
    /revoke all on public\.admin_reauthentication_sessions[\s\S]*from public, anon, authenticated/,
  );
  assert.match(
    migration,
    /drop policy if exists "admin manages content"[\s\S]*drop policy if exists "admin manages content files"[\s\S]*drop policy if exists "admin manages private objects"/,
  );
  assert.match(
    migration,
    /revoke insert, update, delete on public\.content_items[\s\S]*revoke insert, update, delete on public\.content_files/,
  );
  assert.match(
    migration,
    /delete from public\.admin_reauthentication_sessions[\s\S]*token_hash = p_token_hash[\s\S]*expires_at > now\(\)/,
  );
  assert.match(
    migration,
    /revoke all on function public\.begin_admin_reauthentication\(uuid, text\)[\s\S]*from public, anon, authenticated/,
  );
  assert.match(
    migration,
    /revoke all on function public\.publish_content_pdf\([\s\S]*from authenticated/,
  );
  assert.match(migration, /publish_content_pdf_with_reauthentication/);
});
