const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseSecret = process.env.SUPABASE_SECRET_KEY ?? "";
const embeddingUrl =
  process.env.WORKERS_AI_EMBEDDING_URL ??
  "https://haz-que-vuelva-agent.verticalpartnersai.workers.dev/v1/providers/workers-ai/embed";
const providerSecret = process.env.PROVIDER_BACKFILL_SECRET ?? "";
const expectedDimensions = 1_024;
const batchSize = 8;

if (!supabaseUrl || !supabaseSecret || !providerSecret) {
  throw new Error(
    "SUPABASE_URL, SUPABASE_SECRET_KEY and PROVIDER_BACKFILL_SECRET are required",
  );
}

const supabaseHeaders = {
  apikey: supabaseSecret,
  authorization: `Bearer ${supabaseSecret}`,
  "content-type": "application/json",
};

async function assertResponse(response, label) {
  if (response.ok) return response;
  const body = await response.text();
  throw new Error(`${label} failed (${response.status}): ${body.slice(0, 300)}`);
}

const chunksResponse = await assertResponse(
  await fetch(
    `${supabaseUrl}/rest/v1/ai_chunks?embedding=is.null&select=id,content&order=document_id,created_at&limit=1000`,
    { headers: supabaseHeaders },
  ),
  "load chunks",
);
const chunks = await chunksResponse.json();

for (let offset = 0; offset < chunks.length; offset += batchSize) {
  const batch = chunks.slice(offset, offset + batchSize);
  const embeddingResponse = await assertResponse(
    await fetch(embeddingUrl, {
      method: "POST",
      headers: {
        authorization: `Bearer ${providerSecret}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ texts: batch.map((chunk) => chunk.content) }),
    }),
    "generate embeddings",
  );
  const payload = await embeddingResponse.json();
  if (
    payload.dimensions !== expectedDimensions ||
    !Array.isArray(payload.vectors) ||
    payload.vectors.length !== batch.length ||
    payload.vectors.some(
      (vector) =>
        !Array.isArray(vector) || vector.length !== expectedDimensions,
    )
  ) {
    throw new Error("Embedding provider returned an invalid vector shape");
  }

  await Promise.all(
    batch.map(async (chunk, index) =>
      assertResponse(
        await fetch(`${supabaseUrl}/rest/v1/ai_chunks?id=eq.${chunk.id}`, {
          method: "PATCH",
          headers: { ...supabaseHeaders, prefer: "return=minimal" },
          body: JSON.stringify({ embedding: payload.vectors[index] }),
        }),
        `persist embedding ${chunk.id}`,
      ),
    ),
  );
  console.log(`Indexed ${Math.min(offset + batch.length, chunks.length)}/${chunks.length}`);
}

const remainingResponse = await assertResponse(
  await fetch(
    `${supabaseUrl}/rest/v1/ai_chunks?embedding=is.null&select=id&limit=1000`,
    { headers: supabaseHeaders },
  ),
  "verify embeddings",
);
const remaining = await remainingResponse.json();
if (remaining.length > 0) {
  throw new Error(`${remaining.length} chunks remain without embeddings`);
}
console.log(`Embedding backfill complete: ${chunks.length} chunks indexed.`);
