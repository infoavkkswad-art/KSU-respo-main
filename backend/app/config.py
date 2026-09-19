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

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
