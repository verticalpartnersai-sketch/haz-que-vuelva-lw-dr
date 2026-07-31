from uuid import uuid4

import pytest

from app.conversations.supabase_store import SupabaseConversationStore
from app.generation.schemas import GeneratedAnswer, ProviderUsage, SourceReference


class FakeSupabaseClient:
    def __init__(self) -> None:
        self.function = ""
        self.payload = {}

    async def rpc(self, function, payload):
        self.function = function
        self.payload = payload
        return {
            "answer": payload["p_content"],
            "safety_mode": payload["p_provider_usage"]["safety_mode"],
            "sources": payload["p_source_refs"],
        }


@pytest.mark.asyncio
async def test_persists_private_provider_usage_without_losing_it():
    client = FakeSupabaseClient()
    store = SupabaseConversationStore(client)
    source = SourceReference(
        document_id=uuid4(),
        chunk_id=uuid4(),
        scope="global",
    )
    usage = ProviderUsage(
        model="synthetic-model",
        prompt_tokens=100,
        output_tokens=20,
        total_tokens=120,
        cached_tokens=10,
        thoughts_tokens=3,
        tool_tokens=2,
    )
    answer = GeneratedAnswer(
        answer="Respuesta persistida.",
        safety_mode=True,
        sources=[source],
        provider_usage=usage,
    )

    persisted = await store.complete_generation(uuid4(), uuid4(), uuid4(), answer)

    assert client.function == "complete_ai_generation"
    assert client.payload["p_provider_usage"] == {
        "model": "synthetic-model",
        "prompt_tokens": 100,
        "output_tokens": 20,
        "total_tokens": 120,
        "cached_tokens": 10,
        "thoughts_tokens": 3,
        "tool_tokens": 2,
        "safety_mode": True,
    }
    assert persisted.provider_usage == usage
    assert "provider_usage" not in persisted.model_dump(mode="json")
