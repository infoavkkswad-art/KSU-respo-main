from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_database: str = "kawad_swad_db"

    # Production frontend domains
    cors_origins: str = (
        "https://kawadswad.in,"
        "https://www.kawadswad.in,"
        "http://localhost:5173,"
        "http://localhost:3000"
    )

    razorpay_key_id: str = "rzp_test_placeholder"
    razorpay_key_secret: str = "placeholder_secret"
    razorpay_webhook_secret: str = "webhook_secret_placeholder"

    # India Post Sandbox API Configuration
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

    @property
    def is_razorpay_configured(self) -> bool:
        return bool(
            self.razorpay_key_id
            and not self.razorpay_key_id.startswith("rzp_test_placeholder")
            and self.razorpay_key_secret
            and not self.razorpay_key_secret.startswith("placeholder")
        )

    @property
    def is_webhook_configured(self) -> bool:
        return bool(
            self.razorpay_webhook_secret
            and not self.razorpay_webhook_secret.startswith("webhook_secret_placeholder")
        )

    def get_public_summary(self) -> dict:
        return {
            "database": self.mongodb_database,
            "cors_origins_count": len(self.cors_origins_list),
            "razorpay_configured": self.is_razorpay_configured,
            "webhook_configured": self.is_webhook_configured,
        }

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
