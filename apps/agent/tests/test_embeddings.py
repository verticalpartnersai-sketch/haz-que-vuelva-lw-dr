import httpx
import pytest

from app.core.config import Settings
from app.retrieval.gemini_embeddings import GeminiEmbeddingProvider


@pytest.mark.asyncio
async def test_embedding_quota_falls_back_to_lexical_retrieval() -> None:
    provider = GeminiEmbeddingProvider(
        Settings(gemini_api_key="test-key", embedding_dimensions=768)
    )
    await provider._client.aclose()
    provider._client = httpx.AsyncClient(
        transport=httpx.MockTransport(
            lambda request: httpx.Response(
                429,
                request=request,
                json={"error": {"status": "RESOURCE_EXHAUSTED"}},
            )
        ),
        base_url="https://generativelanguage.googleapis.com/v1beta",
    )

    try:
        assert await provider.embed("¿Qué hago si dejó de responder?") is None
    finally:
        await provider.close()


@pytest.mark.asyncio
async def test_embedding_bad_request_is_not_hidden() -> None:
    provider = GeminiEmbeddingProvider(
        Settings(gemini_api_key="test-key", embedding_dimensions=768)
    )
    await provider._client.aclose()
    provider._client = httpx.AsyncClient(
        transport=httpx.MockTransport(
            lambda request: httpx.Response(400, request=request, json={})
        ),
        base_url="https://generativelanguage.googleapis.com/v1beta",
    )

    try:
        with pytest.raises(httpx.HTTPStatusError):
            await provider.embed("consulta")
    finally:
        await provider.close()


@pytest.mark.asyncio
async def test_embedding_quota_uses_multilingual_workers_ai_fallback() -> None:
    dimensions = 1024
    provider = GeminiEmbeddingProvider(
        Settings(
            gemini_api_key="test-key",
            internal_secret="x" * 32,
            embedding_dimensions=dimensions,
            workers_ai_embedding_url="https://worker.test/v1/providers/workers-ai/embed",
        )
    )
    await provider._client.aclose()

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.host == "worker.test":
            assert request.headers["authorization"] == f"Bearer {'x' * 32}"
            return httpx.Response(
                200,
                request=request,
                json={
                    "model": "@cf/baai/bge-m3",
                    "dimensions": dimensions,
                    "vectors": [[0.01] * dimensions],
                },
            )
        return httpx.Response(
            429,
            request=request,
            json={"error": {"status": "RESOURCE_EXHAUSTED"}},
        )

    provider._client = httpx.AsyncClient(
        transport=httpx.MockTransport(handler),
        base_url="https://generativelanguage.googleapis.com/v1beta",
    )

    try:
        vector = await provider.embed("¿Qué hago si dejó de responder?")
        assert vector is not None
        assert len(vector) == dimensions
        assert vector[0] == pytest.approx(0.01)
    finally:
        await provider.close()
