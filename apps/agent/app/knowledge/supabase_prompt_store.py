from app.core.supabase import SupabaseServiceClient


class SupabasePromptStore:
    def __init__(self, client: SupabaseServiceClient) -> None:
        self._client = client

    async def current(self) -> str:
        prompt = await self._client.rpc("current_ai_prompt", {})
        if not isinstance(prompt, str) or not prompt.strip():
            raise RuntimeError("Published AI prompt is unavailable")
        return prompt
