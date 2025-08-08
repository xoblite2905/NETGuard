# backend/app/database.py (The Final, Working Version)

import os
import sys
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger(__name__)

# --- Load DB Configuration from separate, unambiguous variables ---
DB_HOST     = os.getenv("DB_HOST")
DB_PORT     = int(os.getenv("DB_PORT", 5432))
DB_USER     = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME     = os.getenv("DB_NAME")

if not all([DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME]):
    logger.critical("FATAL: Not all separate DB environment variables are set.")
    sys.exit(1)

# Log the connection safely
logger.info(f"--- Configuring Database Engine to connect to {DB_HOST}:{DB_PORT} ---")

try:
    # Build the engine without a URL string to prevent parsing bugs.
    engine = create_engine(
        "postgresql+pg8000://",
        connect_args={
            "user": DB_USER,
            "password": DB_PASSWORD,
            "host": DB_HOST,
            "port": DB_PORT,
            "database": DB_NAME
        }
    )
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()

    def get_db():
        db = SessionLocal()
        try: yield db
        finally: db.close()

    def create_db_and_tables():
        """Creates all tables defined in the SQLAlchemy models."""
        from app import models  # Import here to avoid circular dependencies
        logger.info("--- Creating database tables if they do not exist... ---")
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables are ready.")

except Exception as e:
    logger.critical(f"FATAL: A critical error occurred while creating the database engine: {e}", exc_info=True)
    raise