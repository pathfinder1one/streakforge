from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "StreakForge API"
    database_url: str = "sqlite:///./streakforge.db"
    secret_key: str = "streakforge-dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    gemini_api_key: str = ""  # Set in .env: GEMINI_API_KEY=your_key
    cloudinary_url: str = ""  # Set in .env: CLOUDINARY_URL=cloudinary://...
    cors_origins: list[str] = ["*"]  # In production, set CORS_ORIGINS='["https://yourdomain.com"]'

    class Config:
        env_file = ".env"


settings = Settings()
