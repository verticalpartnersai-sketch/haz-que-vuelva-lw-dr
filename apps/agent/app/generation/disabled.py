from uuid import UUID, uuid4

from app.generation.ports import RetrievedChunk
from app.generation.schemas import GeneratedAnswer


class GenerationDisabledError(RuntimeError):
    pass


class DisabledProvider:
    async def generate(self, **_: object) -> GeneratedAnswer:
        raise GenerationDisabledError("Generation provider is disabled")


class EmptyRetriever:
    async def global_knowledge(self, query: str) -> list[RetrievedChunk]:
        return []

    async def member_memory(
        self,
        member_id: UUID,
        query: str,
    ) -> list[RetrievedChunk]:
        return []


class DisabledPromptStore:
    async def current(self) -> str:
        raise GenerationDisabledError("Prompt persistence is disabled")


class DisabledPersistence:
    async def reserve(
        self,
        member_id: UUID,
        conversation_id: UUID,
        request_id: UUID,
    ) -> None:
        raise GenerationDisabledError("Usage persistence is disabled")

    async def release(self, request_id: UUID) -> None:
        return None

    async def persist_member_message(
        self,
        member_id: UUID,
        conversation_id: UUID,
        request_id: UUID,
        content: str,
    ) -> UUID:
        return uuid4()

    async def complete_generation(
        self,
        member_id: UUID,
        conversation_id: UUID,
        request_id: UUID,
        answer: GeneratedAnswer,
    ) -> GeneratedAnswer:
        return answer
