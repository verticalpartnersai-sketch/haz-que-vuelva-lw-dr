import asyncio
from functools import lru_cache
from typing import Protocol

from app.conversations.supabase_store import SupabaseConversationStore
from app.core.config import get_settings
from app.core.supabase import SupabaseServiceClient
from app.diagnostics.service import DiagnosticService
from app.generation.disabled import (
    DisabledPersistence,
    DisabledPromptStore,
    DisabledProvider,
    EmptyRetriever,
)
from app.generation.gemini_provider import GeminiGenerationProvider
from app.generation.service import GenerationService
from app.knowledge.supabase_prompt_store import SupabasePromptStore
from app.retrieval.gemini_embeddings import GeminiEmbeddingProvider
from app.retrieval.supabase_retriever import SupabaseRetriever
from app.usage.supabase_ledger import SupabaseUsageLedger


class AsyncClosable(Protocol):
    async def close(self) -> None: ...


_active_resources: list[AsyncClosable] = []


@lru_cache
def generation_service() -> GenerationService:
    settings = get_settings()
    if settings.feature_generation:
        client = SupabaseServiceClient(
            settings.supabase_url,
            settings.supabase_secret_key,
        )
        embeddings = GeminiEmbeddingProvider(settings)
        provider = GeminiGenerationProvider(settings)
        _active_resources.extend((client, embeddings, provider))
        return GenerationService(
            usage=SupabaseUsageLedger(client, settings),
            conversations=SupabaseConversationStore(client),
            prompts=SupabasePromptStore(client),
            retriever=SupabaseRetriever(client, embeddings),
            provider=provider,
        )

    persistence = DisabledPersistence()
    return GenerationService(
        usage=persistence,
        conversations=persistence,
        prompts=DisabledPromptStore(),
        retriever=EmptyRetriever(),
        provider=DisabledProvider(),
    )


@lru_cache
def diagnostic_service() -> DiagnosticService:
    settings = get_settings()
    if not settings.feature_generation:
        raise RuntimeError("Diagnostic service is disabled")
    client = SupabaseServiceClient(
        settings.supabase_url,
        settings.supabase_secret_key,
    )
    embeddings = GeminiEmbeddingProvider(settings)
    provider = GeminiGenerationProvider(settings)
    _active_resources.extend((client, embeddings, provider))
    return DiagnosticService(
        client=client,
        prompts=SupabasePromptStore(client),
        retriever=SupabaseRetriever(client, embeddings),
        provider=provider,
        settings=settings,
    )


async def close_generation_resources() -> None:
    resources = list(reversed(_active_resources))
    _active_resources.clear()
    generation_service.cache_clear()
    diagnostic_service.cache_clear()
    await asyncio.gather(
        *(resource.close() for resource in resources),
        return_exceptions=True,
    )
