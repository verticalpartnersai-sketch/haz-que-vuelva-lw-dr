from typing import Any

import httpx


class SupabaseRpcError(RuntimeError):
    def __init__(self, *, function: str, message: str, status_code: int) -> None:
        super().__init__(message)
        self.function = function
        self.message = message
        self.status_code = status_code


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
        if response.is_error:
            message = "supabase_rpc_failed"
            try:
                body = response.json()
                if isinstance(body, dict) and isinstance(body.get("message"), str):
                    message = body["message"]
            except ValueError:
                pass
            raise SupabaseRpcError(
                function=function,
                message=message,
                status_code=response.status_code,
            )
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
