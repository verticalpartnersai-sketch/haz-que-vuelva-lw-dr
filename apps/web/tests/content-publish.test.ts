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
      title: "Guía principal",
    }),
    ContentPdfCleanupError,
  );
});

test("la ruta exige feature, origen y rol admin antes del upload", () => {
  const route = readFileSync(
    new URL("../src/app/api/admin/content/pdfs/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(route, /FEATURE_ADMIN/);
  assert.match(route, /FEATURE_CONTENT/);
  assert.match(route, /requestOriginAllowed/);
  assert.match(route, /await requireAdmin\(\)/);
  assert.doesNotMatch(route, /createSupabaseServiceClient/);
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
