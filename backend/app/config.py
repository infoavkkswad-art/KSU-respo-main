from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_database: str = "kawad_swad_db"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    
    razorpay_key_id: str = "rzp_test_placeholder"
    razorpay_key_secret: str = "placeholder_secret"
    razorpay_webhook_secret: str = "webhook_secret_placeholder"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
