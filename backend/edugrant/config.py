import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # API Settings
    API_TITLE: str = "EduGrant AI API"
    API_VERSION: str = "0.1.0"
    
    # Database Settings
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost:5433/edugrant"
    
    # OpenAI Settings
    OPENAI_API_KEY: str = ""
    
    # Storage Settings
    R2_BUCKET: str = "edugrant-attachments"
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    
    # Email Settings (Resend)
    RESEND_API_KEY: str = "re_Xqy93fpk_MUWo8fmuk26vX1Pswi94k2ic"
    EMAIL_SENDER: str = "onboarding@resend.dev"
    
    # Security Settings
    SECRET_KEY: str = "super-secret-key"
    ALGORITHM: str = "HS256"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
