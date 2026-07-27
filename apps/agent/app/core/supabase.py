from typing import Any

import httpx


class SupabaseServiceClient:
    def __init__(self, url: str, secret_key: str) -> None:
        self._client = httpx.AsyncClient(
            base_url=f"{url.rstrip('/')}/rest/v1",
            headers={
                "apikey": secret_key,
                "Authorization": f"Bearer {secret_key}",
                "Content-Type": "application/json",
            },
            timeout=httpx.Timeout(20),
        )

    async def rpc(self, function: str, payload: dict[str, Any]) -> Any:
        response = await self._client.post(f"/rpc/{function}", json=payload)
        response.raise_for_status()
        return response.json() if response.content else None

    async def insert(
        self,
        table: str,
        payload: dict[str, Any] | list[dict[str, Any]],
    ) -> Any:
        response = await self._client.post(
            f"/{table}",
            json=payload,
            headers={"Prefer": "return=representation"},
        )
        response.raise_for_status()
        return response.json()

    async def close(self) -> None:
        await self._client.aclose()
