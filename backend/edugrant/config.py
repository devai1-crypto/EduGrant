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
    
    # Email Settings (Brevo)
    BREVO_API_KEY: str = "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"
    EMAIL_SENDER: str = "admissions@edugrant.ai"
    MCP_SERVER_KEY: str = "eyJhcGlfa2V5IjoieGtleXNpYi1mMzgyYzFiZTQ2MmEwMzNlMjMyZjEzNTg3OGM1NzZiMDIxN2I3MjgyYTE5MTIwYTFkNGVkNjFkZjcxNDBjODNkLVU5RnozN1BWUU5JeU1FYU4ifQ=="
    
    # Security Settings
    SECRET_KEY: str = "super-secret-key"
    ALGORITHM: str = "HS256"
    ADMIN_PASSWORD: str = "13092025"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
