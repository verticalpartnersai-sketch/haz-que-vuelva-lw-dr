import assert from "node:assert/strict";
import test from "node:test";

import { PDFDocument } from "pdf-lib";

import { PdfLibWatermarkRenderer } from "../src/modules/content/adapters/pdf-lib-watermark-renderer.ts";
import {
  ContentAccessDeniedError,
  requestFileAccess,
  WatermarkedFilePendingError,
  type ContentAccessGateway,
  type ContentArtifact,
} from "../src/modules/content/application/request-file-access.ts";
import {
  runContentWatermarkWorker,
  type ContentWatermarkJob,
  type ContentWatermarkJobs,
  type PdfWatermarkRenderer,
  type SourcePdf,
} from "../src/modules/content/application/run-content-watermark-worker.ts";

const job: ContentWatermarkJob = {
  attempts: 1,
  id: "job-1",
  payload: {
    member_id: "member-1",
    source_file_id: "source-1",
  },
};

async function sourcePdf() {
  const document = await PDFDocument.create();
  document.addPage([612, 792]);
  return new Uint8Array(await document.save());
}

class FakeJobs implements ContentWatermarkJobs {
  artifactPresent = false;
  completed: string[] = [];
  failed: string[] = [];
  retried: string[] = [];
  saved: Array<{ bytes: Uint8Array; marker: string }> = [];
  source: SourcePdf = {
    bytes: new Uint8Array([1]),
    mimeType: "application/pdf",
    sizeBytes: 1,
  };

  async claim() {
    return [job];
  }

  async artifactExists() {
    return this.artifactPresent;
  }

  async loadSource() {
    return this.source;
  }

  async auditMarker() {
    return "marker-123";
  }

  async saveArtifact(
    _job: ContentWatermarkJob,
    bytes: Uint8Array,
    marker: string,
  ) {
    this.saved.push({ bytes, marker });
  }

  async complete(input: ContentWatermarkJob) {
    this.completed.push(input.id);
  }

  async retry(_job: ContentWatermarkJob, code: string) {
    this.retried.push(code);
  }

  async fail(_job: ContentWatermarkJob, code: string) {
    this.failed.push(code);
  }
}

class FakeAccess implements ContentAccessGateway {
  allowed = true;
  artifactValue: ContentArtifact | null = null;
  enqueued: string[] = [];
  recorded: string[] = [];

  async file(fileId: string) {
    return { active: true, id: fileId, productCode: "haz_que_vuelva" };
  }

  async hasEntitlement() {
    return this.allowed;
  }

  async artifact() {
    return this.artifactValue;
  }

  async enqueue(sourceFileId: string) {
    this.enqueued.push(sourceFileId);
  }

  async sign() {
    return "https://storage.example/signed";
  }

  async recordDownload(input: { sourceFileId: string }) {
    this.recorded.push(input.sourceFileId);
  }
}

test("genera una copia individual y completa el job", async () => {
  const jobs = new FakeJobs();
  jobs.source = {
    bytes: await sourcePdf(),
    mimeType: "application/pdf",
    sizeBytes: 583,
  };
  const result = await runContentWatermarkWorker({
    jobs,
    renderer: new PdfLibWatermarkRenderer(),
  });

  assert.deepEqual(result, {
    claimed: 1,
    completed: 1,
    failed: 0,
    retried: 0,
  });
  assert.deepEqual(jobs.completed, ["job-1"]);
  assert.equal(jobs.saved.length, 1);
  const output = await PDFDocument.load(jobs.saved[0].bytes);
  assert.equal(output.getPageCount(), 1);
  assert.equal(output.getSubject(), "Copia individual MARKER-123");
});

test("un artefacto existente completa el job sin regenerarlo", async () => {
  const jobs = new FakeJobs();
  jobs.artifactPresent = true;
  const renderer: PdfWatermarkRenderer = {
    async render() {
      throw new Error("renderer_should_not_run");
    },
  };

  const result = await runContentWatermarkWorker({ jobs, renderer });

  assert.equal(result.completed, 1);
  assert.equal(jobs.saved.length, 0);
  assert.deepEqual(jobs.retried, []);
});

test("rechaza definitivamente una fuente que no sea PDF", async () => {
  const jobs = new FakeJobs();
  jobs.source = {
    bytes: new Uint8Array([1, 2, 3]),
    mimeType: "image/png",
    sizeBytes: 3,
  };
  const renderer: PdfWatermarkRenderer = {
    async render() {
      throw new Error("renderer_should_not_run");
    },
  };

  const result = await runContentWatermarkWorker({ jobs, renderer });

  assert.equal(result.failed, 1);
  assert.deepEqual(jobs.failed, ["unsupported_source_mime_type"]);
  assert.deepEqual(jobs.retried, []);
});

test("un fallo transitorio conserva el job para retry", async () => {
  const jobs = new FakeJobs();
  const renderer: PdfWatermarkRenderer = {
    async render() {
      throw new Error("temporary_runtime_failure");
    },
  };

  const result = await runContentWatermarkWorker({ jobs, renderer });

  assert.equal(result.retried, 1);
  assert.deepEqual(jobs.retried, ["temporary_runtime_failure"]);
  assert.deepEqual(jobs.failed, []);
});

test("el primer acceso autorizado encola la copia sin exponer el original", async () => {
  const gateway = new FakeAccess();

  await assert.rejects(
    requestFileAccess({
      fileId: "source-1",
      gateway,
      memberId: "member-1",
    }),
    WatermarkedFilePendingError,
  );

  assert.deepEqual(gateway.enqueued, ["source-1"]);
  assert.deepEqual(gateway.recorded, []);
});

test("el acceso sin entitlement no puede encolar ni firmar contenido", async () => {
  const gateway = new FakeAccess();
  gateway.allowed = false;

  await assert.rejects(
    requestFileAccess({
      fileId: "source-1",
      gateway,
      memberId: "member-1",
    }),
    ContentAccessDeniedError,
  );

  assert.deepEqual(gateway.enqueued, []);
  assert.deepEqual(gateway.recorded, []);
});

test("la copia existente se audita antes de devolver la URL firmada", async () => {
  const gateway = new FakeAccess();
  gateway.artifactValue = {
    auditMarker: "marker-123",
    storageBucket: "member-sensitive",
    storagePath: "watermarked/member-1/source-1.pdf",
  };

  const result = await requestFileAccess({
    expiresInSeconds: 9_999,
    fileId: "source-1",
    gateway,
    memberId: "member-1",
  });

  assert.equal(result.expiresIn, 300);
  assert.equal(result.signedUrl, "https://storage.example/signed");
  assert.deepEqual(gateway.recorded, ["source-1"]);
});
