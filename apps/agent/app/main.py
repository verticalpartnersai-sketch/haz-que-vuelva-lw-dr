from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.dependencies import close_generation_resources
from app.api.routes import router
from app.generation.disabled import GenerationDisabledError


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    yield
    await close_generation_resources()


app = FastAPI(
    title="VUELVE IA",
    version="0.1.0",
    docs_url=None,
    redoc_url=None,
    lifespan=lifespan,
)
app.include_router(router)


@app.exception_handler(GenerationDisabledError)
async def generation_disabled(
    request: Request,
    error: GenerationDisabledError,
) -> JSONResponse:
    return JSONResponse(
        status_code=503,
        content={"code": "generation_disabled"},
    )
