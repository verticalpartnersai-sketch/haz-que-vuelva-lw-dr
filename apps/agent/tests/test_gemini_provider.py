from uuid import uuid4

import httpx
import pytest

from app.core.config import Settings
from app.diagnostics.schemas import DiagnosticReport
from app.generation.gemini_provider import GeminiGenerationProvider
from app.generation.ports import RetrievedChunk


@pytest.mark.asyncio
async def test_structured_output_contract_and_safety_are_deterministic():
    provider = GeminiGenerationProvider(Settings(gemini_api_key="synthetic-key"))
    captured = {}

    async def fake_request(payload, **kwargs):
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
    assert config["responseJsonSchema"]["type"] == "object"
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

    async def fake_request(payload, **kwargs):
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


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("status", "body", "expected"),
    [
        (401, '{"error":{"message":"invalid key"}}', "provider_authentication_failed"),
        (429, '{"error":{"message":"prepayment credits depleted"}}', "provider_quota_exhausted"),
        (429, '{"error":{"message":"too many requests"}}', "provider_rate_limited"),
        (400, '{"error":{"message":"bad request"}}', "provider_request_rejected"),
        (503, '{"error":{"message":"unavailable"}}', "provider_unavailable"),
    ],
)
async def test_classifies_provider_http_failures(status, body, expected):
    provider = GeminiGenerationProvider(Settings(gemini_api_key="synthetic-key"))
    await provider._client.aclose()
    provider._client = httpx.AsyncClient(
        base_url="https://generativelanguage.googleapis.com/v1beta",
        transport=httpx.MockTransport(
            lambda request: httpx.Response(status, text=body, request=request)
        ),
    )
    try:
        with pytest.raises(RuntimeError, match=expected):
            await provider._request({"contents": []})
    finally:
        await provider.close()


@pytest.mark.asyncio
async def test_falls_back_to_workers_ai_when_gemini_quota_is_exhausted():
    settings = Settings(
        gemini_api_key="synthetic-key",
        internal_secret="x" * 32,
        workers_ai_fallback_url="https://agent.example.test/fallback",
    )
    provider = GeminiGenerationProvider(settings)
    await provider._client.aclose()

    async def handler(request: httpx.Request) -> httpx.Response:
        if request.url.host == "generativelanguage.googleapis.com":
            return httpx.Response(
                429,
                text='{"error":{"message":"prepayment credits depleted"}}',
                request=request,
            )
        assert request.headers["authorization"] == f"Bearer {settings.internal_secret}"
        return httpx.Response(
            200,
            json={
                "response": '{"answer":"Respuesta segura.","safety_mode":false}',
                "usage": {
                    "prompt_tokens": 12,
                    "completion_tokens": 6,
                    "total_tokens": 18,
                },
            },
            request=request,
        )

    provider._client = httpx.AsyncClient(
        base_url="https://generativelanguage.googleapis.com/v1beta",
        transport=httpx.MockTransport(handler),
    )
    try:
        answer = await provider.generate(
            message="Necesito claridad.",
            system_prompt="Approved synthetic system prompt.",
            global_knowledge=[],
            member_memory=[],
            safety_mode=False,
        )
    finally:
        await provider.close()

    assert answer.answer == "Respuesta segura."
    assert answer.provider_usage.model == settings.workers_ai_model
    assert answer.provider_usage.total_tokens == 18


@pytest.mark.asyncio
async def test_diagnostic_prompt_stays_within_worker_message_limit_for_large_export():
    provider = GeminiGenerationProvider(Settings(gemini_api_key="synthetic-key"))
    captured = {}

    async def fake_request(payload, **kwargs):
        captured.update(kwargs)
        report = DiagnosticReport(
            situacion_actual="Resumen.",
            dinamica_de_la_conversacion="Dinámica.",
            estado_emocional_observado="Estado.",
            nivel_de_reciprocidad="Reciprocidad.",
            patrones_que_aumentan_la_distancia=["Patrón."],
            senales_que_aun_favorecen_apertura=["Señal."],
            riesgos_y_limites=["Riesgo."],
            que_interrumpir_ahora=["Interrumpir."],
            proximas_72_horas=["Paso."],
            ruta_de_7_dias=["Ruta."],
            mensaje_sugerido=None,
            nota_de_seguridad=None,
        )
        return {
            "candidates": [
                {"content": {"parts": [{"text": report.model_dump_json()}]}}
            ],
            "usageMetadata": {
                "promptTokenCount": 100,
                "candidatesTokenCount": 20,
                "totalTokenCount": 120,
            },
        }

    provider._request = fake_request
    conversation = "\n".join(
        f"01/08/2026, 10:{index % 60:02d} - Persona: mensaje {index} "
        + ("contenido extenso " * 20)
        for index in range(1_000)
    )
    knowledge = [
        RetrievedChunk(uuid4(), uuid4(), "global", "Conocimiento " * 4_000)
    ]

    try:
        await provider.diagnose(
            conversation=conversation,
            system_prompt="Approved synthetic system prompt.",
            global_knowledge=knowledge,
        )
    finally:
        await provider.close()

    fallback_messages = captured["fallback_messages"]
    assert max(len(message["content"]) for message in fallback_messages) <= 38_000
    diagnostic_prompt = fallback_messages[-1]["content"]
    assert "mensaje 0" in diagnostic_prompt
    assert "mensaje 500" in diagnostic_prompt
    assert "mensaje 999" in diagnostic_prompt
