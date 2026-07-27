import json
import logging
from collections.abc import AsyncIterator

from app.generation.ports import (
    ConversationStore,
    GenerationProvider,
    PromptStore,
    Retriever,
    UsageLedger,
)
from app.generation.schemas import GenerateRequest
from app.safety.policy import evaluate_safety

logger = logging.getLogger(__name__)


def _event(name: str, data: dict[str, object]) -> str:
    return f"event: {name}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


class GenerationService:
    def __init__(
        self,
        *,
        usage: UsageLedger,
        conversations: ConversationStore,
        prompts: PromptStore,
        retriever: Retriever,
        provider: GenerationProvider,
    ) -> None:
        self._usage = usage
        self._conversations = conversations
        self._prompts = prompts
        self._retriever = retriever
        self._provider = provider

    async def stream(self, request: GenerateRequest) -> AsyncIterator[str]:
        await self._usage.reserve(
            request.member_id,
            request.conversation_id,
            request.request_id,
        )
        consumed = False
        try:
            await self._conversations.persist_member_message(
                request.member_id,
                request.conversation_id,
                request.request_id,
                request.message,
            )
            system_prompt = await self._prompts.current()
            yield _event("status", {"step": "retrieving_global"})
            global_knowledge = await self._retriever.global_knowledge(request.message)
            yield _event("status", {"step": "retrieving_member"})
            member_memory = await self._retriever.member_memory(
                request.member_id,
                request.message,
            )
            decision = evaluate_safety(request.message)
            yield _event("status", {"step": "generating"})
            answer = await self._provider.generate(
                message=request.message,
                system_prompt=system_prompt,
                global_knowledge=global_knowledge,
                member_memory=member_memory,
                safety_mode=decision.safety_mode,
            )
            answer = await self._conversations.complete_generation(
                request.member_id,
                request.conversation_id,
                request.request_id,
                answer,
            )
            consumed = True
            yield _event("answer", answer.model_dump(mode="json"))
            yield _event("done", {"consumed": True})
        except BaseException:
            if not consumed:
                try:
                    await self._usage.release(request.request_id)
                except Exception:
                    logger.exception(
                        "Failed to release AI generation reservation",
                        extra={"generation_id": str(request.request_id)},
                    )
            raise
