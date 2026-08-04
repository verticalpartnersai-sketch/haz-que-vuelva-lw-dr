from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.api.dependencies import diagnostic_service, generation_service
from app.core.config import Settings, get_settings
from app.core.security import require_internal_request
from app.diagnostics.schemas import DiagnosticRequest, DiagnosticResponse
from app.diagnostics.service import DiagnosticRejectedError, DiagnosticService
from app.generation.schemas import GenerateRequest
from app.generation.service import GenerationService

router = APIRouter()


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post(
    "/v1/generations/stream",
    dependencies=[Depends(require_internal_request)],
)
async def stream_generation(
    request: GenerateRequest,
    service: Annotated[GenerationService, Depends(generation_service)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> StreamingResponse:
    if not settings.feature_generation:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Generation is disabled",
        )
    return StreamingResponse(
        service.stream(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    )


@router.post(
    "/v1/diagnostics",
    response_model=DiagnosticResponse,
    dependencies=[Depends(require_internal_request)],
)
async def create_diagnostic(
    request: DiagnosticRequest,
    service: Annotated[DiagnosticService, Depends(diagnostic_service)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> DiagnosticResponse:
    if not settings.feature_generation:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Generation is disabled",
        )
    try:
        return await service.run(request)
    except DiagnosticRejectedError as error:
        code = str(error)
        rejected_status = {
            "ai_access_expired": status.HTTP_403_FORBIDDEN,
            "conversation_not_owned": status.HTTP_403_FORBIDDEN,
            "diagnostic_format_invalid": status.HTTP_422_UNPROCESSABLE_CONTENT,
            "diagnostic_monthly_limit_reached": status.HTTP_429_TOO_MANY_REQUESTS,
        }
        raise HTTPException(
            status_code=rejected_status.get(code, status.HTTP_409_CONFLICT),
            detail=code,
        ) from error
    except ValueError as error:
        if str(error) == "invalid_whatsapp_export":
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Invalid WhatsApp export",
            ) from error
        raise
