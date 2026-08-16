import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartPay Global"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smartpay-super-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartpay.db")
    
    # Default Kenya Statutory Rules (2026)
    KENYA_PERSONAL_RELIEF_MONTHLY: float = 2400.0
    KENYA_NSSF_TIER_1_LIMIT: float = 8000.0
    KENYA_NSSF_TIER_2_LIMIT: float = 72000.0
    KENYA_NSSF_RATE: float = 0.06
    KENYA_SHIF_RATE: float = 0.0275
    KENYA_HOUSING_LEVY_RATE: float = 0.015

    class Config:
        case_sensitive = True

settings = Settings()
