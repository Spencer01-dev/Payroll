import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartPay Global"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "smartpay-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    DATABASE_URL: str = "sqlite:///./smartpay.db"
    
    # Default Kenya Statutory Rules (2026)
    KENYA_PERSONAL_RELIEF_MONTHLY: float = 2400.0
    KENYA_NSSF_TIER_1_LIMIT: float = 8000.0
    KENYA_NSSF_TIER_2_LIMIT: float = 72000.0
    KENYA_NSSF_RATE: float = 0.06
    KENYA_SHIF_RATE: float = 0.0275
    KENYA_HOUSING_LEVY_RATE: float = 0.015

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

