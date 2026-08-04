from uuid import UUID

from app.core.supabase import SupabaseServiceClient
from app.generation.schemas import ConversationTurn, GeneratedAnswer


class SupabaseConversationStore:
    def __init__(self, client: SupabaseServiceClient) -> None:
        self._client = client

    async def recent_messages(
        self,
        member_id: UUID,
        conversation_id: UUID,
    ) -> list[ConversationTurn]:
        rows = await self._client.rpc(
            "recent_ai_messages",
            {
                "p_member_id": str(member_id),
                "p_conversation_id": str(conversation_id),
                "p_limit": 12,
            },
        )
        return [ConversationTurn.model_validate(row) for row in rows]

    async def persist_member_message(
        self,
        member_id: UUID,
        conversation_id: UUID,
        request_id: UUID,
        content: str,
    ) -> UUID:
        message_id = await self._client.rpc(
            "persist_ai_member_message",
            {
                "p_generation_id": str(request_id),
                "p_member_id": str(member_id),
                "p_conversation_id": str(conversation_id),
                "p_content": content,
            },
        )
        return UUID(message_id)

    async def complete_generation(
        self,
        member_id: UUID,
        conversation_id: UUID,
        request_id: UUID,
        answer: GeneratedAnswer,
    ) -> GeneratedAnswer:
        persisted = await self._client.rpc(
            "complete_ai_generation",
            {
                "p_generation_id": str(request_id),
                "p_member_id": str(member_id),
                "p_conversation_id": str(conversation_id),
                "p_content": answer.answer,
                "p_source_refs": [
                    source.model_dump(mode="json") for source in answer.sources
                ],
                "p_provider_usage": {
                    **answer.provider_usage.model_dump(mode="json"),
                    "safety_mode": answer.safety_mode,
                },
            },
        )
        return GeneratedAnswer.model_validate(
            {**persisted, "provider_usage": answer.provider_usage}
        )
