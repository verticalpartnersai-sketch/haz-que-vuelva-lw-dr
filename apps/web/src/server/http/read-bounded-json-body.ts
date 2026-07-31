export type BoundedJsonResult =
  | { ok: true; value: unknown }
  | { ok: false; reason: "invalid_json" | "too_large" };

function declaredLengthExceeds(request: Request, maximumBytes: number) {
  const header = request.headers.get("content-length");
  if (!header) return false;

  const length = Number(header);
  return Number.isFinite(length) && length >= 0 && length > maximumBytes;
}

export async function readBoundedJsonBody(
  request: Request,
  maximumBytes: number,
): Promise<BoundedJsonResult> {
  if (declaredLengthExceeds(request, maximumBytes)) {
    return { ok: false, reason: "too_large" };
  }

  const reader = request.body?.getReader();
  if (!reader) return { ok: false, reason: "invalid_json" };

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maximumBytes) {
      await reader.cancel();
      return { ok: false, reason: "too_large" };
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return {
      ok: true,
      value: JSON.parse(new TextDecoder().decode(body)) as unknown,
    };
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
}
