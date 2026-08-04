from uuid import UUID

from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    member_id: UUID
    conversation_id: UUID
    message: str = Field(min_length=1, max_length=30_000)
    request_id: UUID
    allowed_product_codes: list[str] = Field(default_factory=list, max_length=6)


class SourceReference(BaseModel):
    document_id: UUID
    chunk_id: UUID
    scope: str


class ConversationTurn(BaseModel):
    role: str = Field(pattern="^(member|assistant)$")
    content: str = Field(min_length=1, max_length=20_000)


class ProviderUsage(BaseModel):
    model: str = Field(min_length=1, max_length=160)
    prompt_tokens: int = Field(ge=0)
    output_tokens: int = Field(ge=0)
    total_tokens: int = Field(ge=0)
    cached_tokens: int = Field(default=0, ge=0)
    thoughts_tokens: int = Field(default=0, ge=0)
    tool_tokens: int = Field(default=0, ge=0)


class GeneratedAnswer(BaseModel):
    answer: str = Field(min_length=1, max_length=20_000)
    safety_mode: bool = False
    sources: list[SourceReference] = Field(default_factory=list)
    provider_usage: ProviderUsage = Field(exclude=True)
