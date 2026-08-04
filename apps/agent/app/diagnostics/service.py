import base64
import binascii

from app.cases.text_import import (
    UnsafeImportError,
    import_txt,
    import_txt_zip,
    redact_sensitive_text,
)
from app.core.config import Settings
from app.core.supabase import SupabaseRpcError, SupabaseServiceClient
from app.diagnostics.schemas import DiagnosticRequest, DiagnosticResponse
from app.generation.gemini_provider import GeminiGenerationProvider
from app.knowledge.supabase_prompt_store import SupabasePromptStore
from app.retrieval.supabase_retriever import SupabaseRetriever


class DiagnosticRejectedError(RuntimeError):
    pass


class DiagnosticService:
    def __init__(
        self,
        *,
        client: SupabaseServiceClient,
        prompts: SupabasePromptStore,
        retriever: SupabaseRetriever,
        provider: GeminiGenerationProvider,
        settings: Settings,
    ) -> None:
        self._client = client
        self._prompts = prompts
        self._retriever = retriever
        self._provider = provider
        self._max_characters = settings.diagnostic_max_characters
        self._daily_limit = settings.daily_response_limit

    async def run(self, request: DiagnosticRequest) -> DiagnosticResponse:
        try:
            await self._client.rpc(
                "reserve_ai_diagnostic",
                {
                    "p_diagnostic_id": str(request.diagnostic_id),
                    "p_generation_id": str(request.generation_id),
                    "p_member_id": str(request.member_id),
                    "p_conversation_id": str(request.conversation_id),
                    "p_input_format": request.input_format,
                },
            )
        except SupabaseRpcError as error:
            if error.message in {
                "ai_access_expired",
                "conversation_not_owned",
                "diagnostic_format_invalid",
                "diagnostic_monthly_limit_reached",
            }:
                raise DiagnosticRejectedError(error.message) from error
            raise
        try:
            payload = base64.b64decode(request.payload_base64, validate=True)
            imported = (
                import_txt(payload, max_characters=self._max_characters)
                if request.input_format == "txt"
                else import_txt_zip(payload, max_characters=self._max_characters)
            )
            prompt = await self._prompts.current()
            redacted_content = redact_sensitive_text(imported.content)
            query = redacted_content[-8_000:]
            knowledge = await self._retriever.global_knowledge(
                query,
                request.allowed_product_codes,
            )
            report, usage = await self._provider.diagnose(
                conversation=redacted_content,
                system_prompt=prompt,
                global_knowledge=knowledge,
            )
            await self._client.rpc(
                "complete_ai_diagnostic",
                {
                    "p_diagnostic_id": str(request.diagnostic_id),
                    "p_member_id": str(request.member_id),
                    "p_character_count": len(imported.content),
                    "p_content": report.as_text(),
                    "p_provider_usage": usage.model_dump(mode="json"),
                },
            )
            status = await self._client.rpc(
                "get_ai_usage_status",
                {
                    "p_member_id": str(request.member_id),
                    "p_daily_limit": self._daily_limit,
                },
            )
            return DiagnosticResponse(
                diagnostic_id=request.diagnostic_id,
                report=report,
                formatted_report=report.as_text(),
                messages_remaining=status["messages_remaining"],
            )
        except (binascii.Error, UnsafeImportError) as error:
            await self._fail(request, "invalid_whatsapp_export")
            raise ValueError("invalid_whatsapp_export") from error
        except BaseException:
            await self._fail(request, "diagnostic_failed")
            raise

    async def _fail(self, request: DiagnosticRequest, code: str) -> None:
        await self._client.rpc(
            "fail_ai_diagnostic",
            {"p_diagnostic_id": str(request.diagnostic_id), "p_error_code": code},
        )
