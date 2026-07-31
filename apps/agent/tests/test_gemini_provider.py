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
            ],
            "usageMetadata": {
                "promptTokenCount": 110,
                "candidatesTokenCount": 24,
                "totalTokenCount": 140,
                "cachedContentTokenCount": 6,
            },
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
    assert config["maxOutputTokens"] == 2_048
    assert answer.safety_mode is True
    assert answer.provider_usage.prompt_tokens == 110
    assert answer.provider_usage.output_tokens == 24
    assert answer.provider_usage.total_tokens == 140
    assert answer.provider_usage.cached_tokens == 6
    assert "provider_usage" not in answer.model_dump(mode="json")


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("usage_metadata", "error_type", "expected_error"),
    [
        (None, TypeError, "gemini_usage_metadata_missing"),
        (
            {
                "promptTokenCount": 10,
                "candidatesTokenCount": -1,
                "totalTokenCount": 9,
            },
            ValueError,
            "gemini_usage_metadata_invalid",
        ),
        (
            {"promptTokenCount": 10, "candidatesTokenCount": 2},
            ValueError,
            "gemini_usage_metadata_invalid",
        ),
    ],
)
async def test_rejects_missing_or_invalid_usage_metadata(
    usage_metadata, error_type, expected_error
):
    provider = GeminiGenerationProvider(Settings(gemini_api_key="synthetic-key"))

    async def fake_request(payload):
        response = {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {"text": '{"answer":"Respuesta.","safety_mode":false}'}
                        ]
                    }
                }
            ]
        }
        if usage_metadata is not None:
            response["usageMetadata"] = usage_metadata
        return response

    provider._request = fake_request
    try:
        with pytest.raises(error_type, match=expected_error):
            await provider.generate(
                message="Mensaje.",
                system_prompt="Approved synthetic system prompt.",
                global_knowledge=[],
                member_memory=[],
                safety_mode=False,
            )
    finally:
        await provider.close()
