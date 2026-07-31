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


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("daily_response_limit", 0),
        ("daily_response_limit", 21),
        ("max_output_tokens", 255),
        ("max_output_tokens", 4_097),
    ],
)
def test_rejects_unsafe_generation_limits(field, value):
    with pytest.raises(ValidationError):
        Settings(**{field: value})
