from uuid import UUID

from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    member_id: UUID
    conversation_id: UUID
    message: str = Field(min_length=1, max_length=30_000)
    request_id: UUID


class SourceReference(BaseModel):
    document_id: UUID
    chunk_id: UUID
    scope: str


class GeneratedAnswer(BaseModel):
    answer: str = Field(min_length=1, max_length=20_000)
    safety_mode: bool = False
    sources: list[SourceReference] = Field(default_factory=list)
