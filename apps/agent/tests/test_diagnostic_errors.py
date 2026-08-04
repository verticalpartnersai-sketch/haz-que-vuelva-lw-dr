from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.api.routes import create_diagnostic
from app.core.supabase import SupabaseRpcError
from app.diagnostics.schemas import DiagnosticRequest
from app.diagnostics.service import DiagnosticRejectedError, DiagnosticService


def diagnostic_request() -> DiagnosticRequest:
    return DiagnosticRequest(
        diagnostic_id=uuid4(),
        generation_id=uuid4(),
        member_id=uuid4(),
        conversation_id=uuid4(),
        input_format="txt",
        payload_base64="dGVzdA==",
        allowed_product_codes=[],
    )


class LimitReachedClient:
    async def rpc(self, function, payload):
        del function, payload
        raise SupabaseRpcError(
            function="reserve_ai_diagnostic",
            message="diagnostic_monthly_limit_reached",
            status_code=400,
        )


@pytest.mark.asyncio
async def test_service_translates_monthly_limit_rpc_failure():
    service = DiagnosticService(
        client=LimitReachedClient(),
        prompts=None,
        retriever=None,
        provider=None,
        settings=SimpleNamespace(
            diagnostic_max_characters=400_000,
            daily_response_limit=10,
        ),
    )

    with pytest.raises(DiagnosticRejectedError) as raised:
        await service.run(diagnostic_request())

    assert str(raised.value) == "diagnostic_monthly_limit_reached"


class RejectedService:
    async def run(self, request):
        del request
        raise DiagnosticRejectedError("diagnostic_monthly_limit_reached")


@pytest.mark.asyncio
async def test_route_returns_429_when_monthly_diagnostic_was_used():
    with pytest.raises(HTTPException) as raised:
        await create_diagnostic(
            diagnostic_request(),
            RejectedService(),
            SimpleNamespace(feature_generation=True),
        )

    assert raised.value.status_code == 429
    assert raised.value.detail == "diagnostic_monthly_limit_reached"
