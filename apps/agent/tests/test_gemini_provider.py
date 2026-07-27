from uuid import uuid4

import pytest

from app.core.config import Settings
from app.generation.gemini_provider import GeminiGenerationProvider
from app.generation.ports import RetrievedChunk


@pytest.mark.asyncio
async def test_structured_output_contract_and_safety_are_deterministic():
    provider = GeminiGenerationProvider(Settings(gemini_api_key="synthetic-key"))
    captured = {}

    async def fake_request(payload):
        captured.update(payload)
        return {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {
                                "text": (
                                    '{"answer":"Busca apoyo local.",'
                                    '"safety_mode":false}'
                                )
                            }
                        ]
                    }
                }
            ]
        }

    provider._request = fake_request
    chunk = RetrievedChunk(uuid4(), uuid4(), "global", "Dato aprobado.")
    try:
        answer = await provider.generate(
            message="Hay una amenaza inmediata.",
            system_prompt="Approved synthetic system prompt.",
            global_knowledge=[chunk],
            member_memory=[],
            safety_mode=True,
        )
    finally:
        await provider.close()

    config = captured["generationConfig"]
    assert config["responseMimeType"] == "application/json"
    assert config["responseSchema"]["type"] == "object"
    assert answer.safety_mode is True
