export class ContentAccessDeniedError extends Error {}
export class ContentFileNotFoundError extends Error {}
export class WatermarkedFilePendingError extends Error {}

export type ContentAccessPurpose = "download" | "view";

export type ContentSource = {
  active: boolean;
  id: string;
  productCode: string;
};

export type ContentArtifact = {
  auditMarker: string;
  storageBucket: string;
  storagePath: string;
};

export interface ContentAccessGateway {
  file(fileId: string): Promise<ContentSource | null>;
  hasEntitlement(memberId: string, productCode: string): Promise<boolean>;
  artifact(
    sourceFileId: string,
    memberId: string,
  ): Promise<ContentArtifact | null>;
  enqueue(sourceFileId: string, memberId: string): Promise<void>;
  sign(
    storageBucket: string,
    storagePath: string,
    expiresInSeconds: number,
    purpose: ContentAccessPurpose,
  ): Promise<string | null>;
  recordDownload(input: {
    auditMarker: string;
    memberId: string;
    sourceFileId: string;
  }): Promise<void>;
}

export async function requestFileAccess(input: {
  gateway: ContentAccessGateway;
  fileId: string;
  memberId: string;
  expiresInSeconds?: number;
  purpose?: ContentAccessPurpose;
}) {
  const expiresIn = Math.min(Math.max(input.expiresInSeconds ?? 120, 30), 300);
  const purpose = input.purpose ?? "download";
  const file = await input.gateway.file(input.fileId);
  if (!file) throw new ContentFileNotFoundError();
  if (!file.active) throw new ContentAccessDeniedError();
  if (
    !(await input.gateway.hasEntitlement(input.memberId, file.productCode))
  ) {
    throw new ContentAccessDeniedError();
  }

  const artifact = await input.gateway.artifact(file.id, input.memberId);
  if (!artifact) {
    await input.gateway.enqueue(file.id, input.memberId);
    throw new WatermarkedFilePendingError();
  }

  const signedUrl = await input.gateway.sign(
    artifact.storageBucket,
    artifact.storagePath,
    expiresIn,
    purpose,
  );
  if (!signedUrl) throw new ContentAccessDeniedError();
  if (purpose === "download") {
    await input.gateway.recordDownload({
      auditMarker: artifact.auditMarker,
      memberId: input.memberId,
      sourceFileId: file.id,
    });
  }

  return { signedUrl, expiresIn };
}
