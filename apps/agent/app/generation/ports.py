from dataclasses import dataclass
from typing import Protocol
from uuid import UUID

from app.generation.schemas import ConversationTurn, GeneratedAnswer


@dataclass(frozen=True)
class RetrievedChunk:
    document_id: UUID
    chunk_id: UUID
    content: str
    scope: str


class UsageLedger(Protocol):
    async def reserve(
        self,
        member_id: UUID,
        conversation_id: UUID,
        request_id: UUID,
    ) -> None: ...

    async def release(self, request_id: UUID) -> None: ...


class ConversationStore(Protocol):
    async def recent_messages(
        self,
        member_id: UUID,
        conversation_id: UUID,
    ) -> list[ConversationTurn]: ...

    async def persist_member_message(
        self,
        member_id: UUID,
        conversation_id: UUID,
        request_id: UUID,
        content: str,
    ) -> UUID: ...

    async def complete_generation(
        self,
        member_id: UUID,
        conversation_id: UUID,
        request_id: UUID,
        answer: GeneratedAnswer,
    ) -> GeneratedAnswer: ...


class PromptStore(Protocol):
    async def current(self) -> str: ...


class Retriever(Protocol):
    async def global_knowledge(
        self,
        query: str,
        allowed_product_codes: list[str],
    ) -> list[RetrievedChunk]: ...

    async def member_memory(
        self,
        member_id: UUID,
        query: str,
    ) -> list[RetrievedChunk]: ...


class GenerationProvider(Protocol):
    async def generate(
        self,
        *,
        message: str,
        system_prompt: str,
        global_knowledge: list[RetrievedChunk],
        member_memory: list[RetrievedChunk],
        history: list[ConversationTurn],
        safety_mode: bool,
        safety_category: str | None,
    ) -> GeneratedAnswer: ...
