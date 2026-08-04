import logging

import httpx

from app.core.config import Settings

logger = logging.getLogger(__name__)


class GeminiEmbeddingProvider:
    def __init__(self, settings: Settings) -> None:
        self._api_key = settings.gemini_api_key
        self._model = settings.embedding_model
        self._dimensions = settings.embedding_dimensions
        self._fallback_url = settings.workers_ai_embedding_url
        self._internal_secret = settings.internal_secret
        self._client = httpx.AsyncClient(
            base_url="https://generativelanguage.googleapis.com/v1beta",
            timeout=httpx.Timeout(30),
        )

    async def close(self) -> None:
        await self._client.aclose()

    async def embed(self, text: str) -> list[float] | None:
        response = await self._client.post(
            f"/models/{self._model}:embedContent",
            headers={"x-goog-api-key": self._api_key},
            json={
                "model": f"models/{self._model}",
                "content": {
                    "parts": [{
                        "text": (
                            "Tarea: recuperar orientación relacional pertinente y "
                            f"segura para una consulta en español.\nConsulta: {text}"
                        )
                    }]
                },
                "outputDimensionality": self._dimensions,
            },
        )
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as error:
            if error.response.status_code not in {
                401,
                403,
                429,
                500,
                502,
                503,
                504,
            }:
                raise
            return await self._fallback_embedding(text, error.response.status_code)
        values = response.json()["embedding"]["values"]
        if len(values) != self._dimensions:
            raise RuntimeError("Unexpected embedding dimensions")
        return [float(value) for value in values]

    async def _fallback_embedding(
        self,
        text: str,
        status_code: int,
    ) -> list[float] | None:
        if not self._fallback_url or not self._internal_secret:
            logger.warning(
                "Embedding provider unavailable; using lexical retrieval",
                extra={"status_code": status_code},
            )
            return None
        response = await self._client.post(
            self._fallback_url,
            headers={"authorization": f"Bearer {self._internal_secret}"},
            json={"texts": [text]},
        )
        if response.is_error:
            logger.warning(
                "Embedding fallback unavailable; using lexical retrieval",
                extra={"status_code": response.status_code},
            )
            return None
        payload = response.json()
        vectors = payload.get("vectors")
        if (
            not isinstance(vectors, list)
            or len(vectors) != 1
            or not isinstance(vectors[0], list)
            or len(vectors[0]) != self._dimensions
        ):
            raise RuntimeError("Unexpected fallback embedding dimensions")
        return [float(value) for value in vectors[0]]
