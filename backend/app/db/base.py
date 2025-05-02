from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import Generator, Optional

from app.core.config import settings

# Only create engine if DATABASE_URL is provided
if settings.DATABASE_URL:
    engine = create_engine(str(settings.DATABASE_URL))
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    # Dummy session for testing without DB
    engine = None
    
    class DummySession:
        def __enter__(self):
            return self
            
        def __exit__(self, exc_type, exc_val, exc_tb):
            pass
            
        def close(self):
            pass
    
    def get_dummy_session():
        return DummySession()
    
    SessionLocal = get_dummy_session

# Dependency to get DB session
def get_db() -> Generator:
    db = None
    try:
        if settings.DATABASE_URL:
            db = SessionLocal()
            yield db
        else:
            # Return None if there's no database connection
            yield None
    finally:
        if db:
            db.close()

Base = declarative_base()