import asyncio
from uuid import uuid4

import pytest

from app.generation.ports import RetrievedChunk
from app.generation.schemas import GeneratedAnswer, GenerateRequest
from app.generation.service import GenerationService


class FakeLedger:
    def __init__(self) -> None:
        self.reserved = False
        self.released = False

    async def reserve(self, member_id, conversation_id, request_id) -> None:
        self.reserved = True

    async def release(self, request_id) -> None:
        self.released = True


class FakeStore:
    def __init__(self, fail_completion: bool = False) -> None:
        self.fail_completion = fail_completion

    async def persist_member_message(
        self, member_id, conversation_id, request_id, content
    ):
        return uuid4()

    async def complete_generation(self, member_id, conversation_id, request_id, answer):
        if self.fail_completion:
            raise RuntimeError("completion transaction failed")
        return answer


class ScopedRetriever:
    def __init__(self, member_id) -> None:
        self.member_id = member_id

    async def global_knowledge(self, query):
        return [RetrievedChunk(uuid4(), uuid4(), "global", "global")]

    async def member_memory(self, member_id, query):
        assert member_id == self.member_id
        return [RetrievedChunk(uuid4(), uuid4(), "member", "member")]


class FakePromptStore:
    async def current(self):
        return "Approved system prompt."


class MissingPromptStore:
    async def current(self):
        raise RuntimeError("published prompt required")


class FakeProvider:
    def __init__(self, fail: bool = False) -> None:
        self.fail = fail

    async def generate(self, **kwargs):
        assert kwargs["system_prompt"] == "Approved system prompt."
        assert kwargs["global_knowledge"][0].scope == "global"
        assert kwargs["member_memory"][0].scope == "member"
        if self.fail:
            raise RuntimeError("provider unavailable")
        return GeneratedAnswer(answer="Respuesta sustantiva.")


def request():
    return GenerateRequest(
        member_id=uuid4(),
        conversation_id=uuid4(),
        message="Necesito claridad.",
        request_id=uuid4(),
    )


@pytest.mark.asyncio
async def test_consumes_only_after_persisted_answer():
    input_data = request()
    ledger = FakeLedger()
    service = GenerationService(
        usage=ledger,
        conversations=FakeStore(),
        prompts=FakePromptStore(),
        retriever=ScopedRetriever(input_data.member_id),
        provider=FakeProvider(),
    )

    events = [event async for event in service.stream(input_data)]

    assert ledger.reserved
    assert not ledger.released
    assert any("event: answer" in event for event in events)


@pytest.mark.asyncio
async def test_releases_reservation_when_provider_fails():
    input_data = request()
    ledger = FakeLedger()
    service = GenerationService(
        usage=ledger,
        conversations=FakeStore(),
        prompts=FakePromptStore(),
        retriever=ScopedRetriever(input_data.member_id),
        provider=FakeProvider(fail=True),
    )

    with pytest.raises(RuntimeError):
        [event async for event in service.stream(input_data)]

    assert ledger.reserved and ledger.released


@pytest.mark.asyncio
async def test_releases_reservation_when_stream_is_cancelled():
    class CancelledProvider(FakeProvider):
        async def generate(self, **kwargs):
            raise asyncio.CancelledError()

    input_data = request()
    ledger = FakeLedger()
    service = GenerationService(
        usage=ledger,
        conversations=FakeStore(),
        prompts=FakePromptStore(),
        retriever=ScopedRetriever(input_data.member_id),
        provider=CancelledProvider(),
    )

    with pytest.raises(asyncio.CancelledError):
        [event async for event in service.stream(input_data)]

    assert ledger.reserved and ledger.released


@pytest.mark.asyncio
async def test_releases_reservation_when_completion_transaction_fails():
    input_data = request()
    ledger = FakeLedger()
    service = GenerationService(
        usage=ledger,
        conversations=FakeStore(fail_completion=True),
        prompts=FakePromptStore(),
        retriever=ScopedRetriever(input_data.member_id),
        provider=FakeProvider(),
    )

    with pytest.raises(RuntimeError, match="completion transaction failed"):
        [event async for event in service.stream(input_data)]

    assert ledger.reserved and ledger.released


@pytest.mark.asyncio
async def test_releases_reservation_when_no_prompt_is_published():
    input_data = request()
    ledger = FakeLedger()
    service = GenerationService(
        usage=ledger,
        conversations=FakeStore(),
        prompts=MissingPromptStore(),
        retriever=ScopedRetriever(input_data.member_id),
        provider=FakeProvider(),
    )

    with pytest.raises(RuntimeError, match="published prompt required"):
        [event async for event in service.stream(input_data)]

    assert ledger.reserved and ledger.released
