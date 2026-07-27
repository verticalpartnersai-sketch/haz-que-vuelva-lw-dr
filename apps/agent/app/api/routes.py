from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.api.dependencies import generation_service
from app.core.config import Settings, get_settings
from app.core.security import require_internal_request
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
