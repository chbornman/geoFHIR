import logging
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.base import engine, Base
from app.models.geospatial import GeoFeature, GeoDataset, FeatureDatasetAssociation

logger = logging.getLogger(__name__)

def init_db():
    """Initialize database by creating tables and extensions"""
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        
        # Create PostGIS extension if it doesn't exist
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
            conn.commit()
            
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise