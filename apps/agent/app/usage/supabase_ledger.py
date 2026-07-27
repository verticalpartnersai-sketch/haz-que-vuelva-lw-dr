from uuid import UUID

from app.core.config import Settings
from app.core.supabase import SupabaseServiceClient


class SupabaseUsageLedger:
    def __init__(self, client: SupabaseServiceClient, settings: Settings) -> None:
        self._client = client
        self._daily_limit = settings.daily_response_limit

    async def reserve(
        self,
        member_id: UUID,
        conversation_id: UUID,
        request_id: UUID,
    ) -> None:
        await self._client.rpc(
            "reserve_ai_generation",
            {
                "p_generation_id": str(request_id),
                "p_member_id": str(member_id),
                "p_conversation_id": str(conversation_id),
                "p_daily_limit": self._daily_limit,
            },
        )

    async def release(self, request_id: UUID) -> None:
        await self._client.rpc(
            "release_ai_generation",
            {"p_generation_id": str(request_id), "p_status": "failed"},
        )
