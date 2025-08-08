# backend/app/config.py

import os
from dotenv import load_dotenv
from pathlib import Path

# Assuming .env is in the parent 'backend' directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000)) # Default FastAPI port is 8000
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    
    # Existing database URI
    SQLALCHEMY_DATABASE_URI: str = os.getenv("DATABASE_URL")
    if not SQLALCHEMY_DATABASE_URI:
        raise ValueError("❌ Environment variable DATABASE_URL is not set or empty.")
    
    # ### --- START OF CHANGE --- ###
    # Add Elasticsearch URI from environment variable
    ELASTICSEARCH_URI: str = os.getenv("ELASTICSEARCH_URI")
    if not ELASTICSEARCH_URI:
        raise ValueError("❌ Environment variable ELASTICSEARCH_URI is not set or empty.")
    # ### --- END OF CHANGE --- ###

settings = Settings()
