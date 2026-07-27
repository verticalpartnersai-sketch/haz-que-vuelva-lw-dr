from typing import Protocol
from uuid import UUID

from app.core.supabase import SupabaseServiceClient
from app.generation.ports import RetrievedChunk


class EmbeddingProvider(Protocol):
    async def embed(self, text: str) -> list[float]: ...


class SupabaseRetriever:
    def __init__(
        self,
        client: SupabaseServiceClient,
        embeddings: EmbeddingProvider,
    ) -> None:
        self._client = client
        self._embeddings = embeddings

    async def _retrieve(
        self,
        *,
        member_id: UUID,
        query: str,
        scope: str,
    ) -> list[RetrievedChunk]:
        vector = await self._embeddings.embed(query)
        rows = await self._client.rpc(
            "match_ai_chunks",
            {
                "p_member_id": str(member_id),
                "p_query": query,
                "p_embedding": vector,
                "p_scope": scope,
                "p_limit": 8,
            },
        )
        return [
            RetrievedChunk(
                document_id=UUID(row["document_id"]),
                chunk_id=UUID(row["chunk_id"]),
                content=row["content"],
                scope=row["scope"],
            )
            for row in rows
        ]

    async def global_knowledge(self, query: str) -> list[RetrievedChunk]:
        return await self._retrieve(
            member_id=UUID(int=0),
            query=query,
            scope="global",
        )

    async def member_memory(
        self,
        member_id: UUID,
        query: str,
    ) -> list[RetrievedChunk]:
        return await self._retrieve(
            member_id=member_id,
            query=query,
            scope="member",
        )
