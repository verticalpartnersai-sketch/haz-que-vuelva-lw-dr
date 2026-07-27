import httpx

from app.core.config import Settings


class GeminiEmbeddingProvider:
    def __init__(self, settings: Settings) -> None:
        self._api_key = settings.gemini_api_key
        self._model = settings.embedding_model
        self._dimensions = settings.embedding_dimensions
        self._client = httpx.AsyncClient(
            base_url="https://generativelanguage.googleapis.com/v1beta",
            timeout=httpx.Timeout(30),
        )

    async def close(self) -> None:
        await self._client.aclose()

    async def embed(self, text: str) -> list[float]:
        response = await self._client.post(
            f"/models/{self._model}:embedContent",
            headers={"x-goog-api-key": self._api_key},
            json={
                "model": f"models/{self._model}",
                "content": {"parts": [{"text": text}]},
                "outputDimensionality": self._dimensions,
            },
        )
        response.raise_for_status()
        values = response.json()["embedding"]["values"]
        if len(values) != self._dimensions:
            raise RuntimeError("Unexpected embedding dimensions")
        return [float(value) for value in values]
