from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

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

Base = declarative_base()