import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_generation_rejects_short_internal_secret():
    with pytest.raises(ValidationError, match="at least 32 characters"):
        Settings(
            feature_generation=True,
            internal_secret="too-short",
            gemini_api_key="synthetic-gemini-key",
            supabase_url="https://synthetic.supabase.co",
            supabase_secret_key="synthetic-supabase-secret",
        )
