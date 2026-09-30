from pydantic_settings import BaseSettings
from typing import List, Sequence


# Values that shipped in source as silent defaults.
# An explicit env var equal to a real local Mongo URI is allowed;
# these strings fail boot only when they are the configured secret.
RAZORPAY_PLACEHOLDERS = frozenset(
    {
        "rzp_test_placeholder",
        "placeholder_secret",
        "webhook_secret_placeholder",
    }
)


class Settings(BaseSettings):
    mongodb_uri: str = ""
    mongodb_database: str = "kawad_swad_db"

    # Production frontend domains
    cors_origins: str = (
        "https://kawadswad.in,"
        "https://www.kawadswad.in,"
        "http://localhost:5173,"
        "http://localhost:3000"
    )

    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    razorpay_webhook_secret: str = ""

    # India Post Sandbox API Configuration
    # Not required to boot; unused by checkout until booking exists.
    india_post_base_url: str = "https://test.cept.gov.in/beextcustomer"
    india_post_customer_id: str = "9999173774"
    india_post_username: str = "sandbox_user_placeholder"
    india_post_password: str = "sandbox_password_placeholder"

    @property
    def cors_origins_list(self) -> List[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]

    class Config:
        env_file = ".env"
        extra = "ignore"


def _clean_secret(value: object) -> str:
    return str(value or "").strip()


def _is_placeholder_secret(value: str) -> bool:
    lowered = value.lower()
    if not lowered:
        return True
    if lowered in RAZORPAY_PLACEHOLDERS:
        return True
    if "placeholder" in lowered:
        return True
    return False


def required_boot_secret_errors(
    settings: Settings,
) -> List[str]:
    """
    Return human-readable boot failures for missing or placeholder
    Razorpay keys / webhook secret / Mongo URI.
    """

    errors: List[str] = []

    mongo_uri = _clean_secret(settings.mongodb_uri)
    if not mongo_uri:
        errors.append(
            "MONGODB_URI is missing. Set a MongoDB connection string."
        )

    checks: Sequence[tuple[str, str]] = (
        ("RAZORPAY_KEY_ID", _clean_secret(settings.razorpay_key_id)),
        ("RAZORPAY_KEY_SECRET", _clean_secret(settings.razorpay_key_secret)),
        (
            "RAZORPAY_WEBHOOK_SECRET",
            _clean_secret(settings.razorpay_webhook_secret),
        ),
    )

    for name, value in checks:
        if _is_placeholder_secret(value):
            errors.append(
                f"{name} is missing or set to a placeholder. "
                "Set a real Razorpay value from the dashboard."
            )

    return errors


def assert_runtime_secrets(settings: Settings) -> None:
    errors = required_boot_secret_errors(settings)
    if errors:
        detail = " ".join(errors)
        raise RuntimeError(
            "Kawad Swad API refused to boot: " + detail
        )


settings = Settings()
