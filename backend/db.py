import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    """Create a PostgreSQL connection to Supabase (Tier 3 Data Layer)."""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set. Copy backend/.env.example to backend/.env and set your Supabase PostgreSQL URI.")
    
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)