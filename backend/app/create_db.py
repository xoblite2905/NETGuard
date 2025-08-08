# backend/app/create_db.py

import sys
import time

# Give the database a moment to fully initialize, just in case.
# This can help prevent rare race conditions on slow systems.
time.sleep(3)

try:
    # --- NON-INTERACTIVE AUTOMATION SCRIPT ---
    # This script will automatically create all tables based on your defined models.

    print("--- Automated Database Initializer ---")
    print("Importing configured database engine from 'app.database'...")

    # Import the configured engine. This is already connected to the correct database
    # because your app.database and app.config modules read the .env variables.
    from app.database import engine

    # Import the Base class and ALL of your models.
    # This is ESSENTIAL so that SQLAlchemy knows what tables to create.
    from app.models import Base, Host, NetworkPacket, NetworkPort, User, Vulnerability
    
    print("Connecting to the database engine and creating tables (if they do not exist)...")

    # This single command connects to the database using the engine and creates all
    # tables that inherit from your 'Base' class. It intelligently skips any
    # tables that already exist, making it safe to run every time.
    Base.metadata.create_all(bind=engine)

    print("✅ Database schema creation/verification complete.")
    # --- END OF AUTOMATION SCRIPT ---

except ImportError as e:
    print(f"❌ ImportError: Failed to import a necessary module. Check your paths and dependencies. Error: {e}", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"❌ An unexpected error occurred during database initialization: {e}", file=sys.stderr)
    sys.exit(1)
