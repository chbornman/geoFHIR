from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import JSONB
from geoalchemy2 import Geometry

from app.db.base import Base
from app.core.config import settings

class GeoFeature(Base):
    """Model for storing geographic features like hospital locations, health service areas, etc."""
    __tablename__ = "geo_features"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    feature_type = Column(String(50), nullable=False, index=True)  # hospital, clinic, service area, etc.
    description = Column(Text, nullable=True)
    properties = Column(JSONB, nullable=True)  # Additional properties from GeoJSON
    
    # GeoAlchemy2 geometry column, stores the actual geometry
    geometry = Column(Geometry(srid=settings.POSTGIS_SRID), nullable=False)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<GeoFeature {self.name} ({self.feature_type})>"


class GeoDataset(Base):
    """Model for tracking uploaded GeoJSON datasets"""
    __tablename__ = "geo_datasets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    source = Column(String(255), nullable=True)  # Source of the data
    original_filename = Column(String(255), nullable=True)
    
    # Metadata/properties from the original GeoJSON
    metadata = Column(JSONB, nullable=True)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<GeoDataset {self.name}>"


class FeatureDatasetAssociation(Base):
    """Association table between features and datasets"""
    __tablename__ = "feature_dataset_association"
    
    id = Column(Integer, primary_key=True, index=True)
    feature_id = Column(Integer, ForeignKey("geo_features.id"), nullable=False)
    dataset_id = Column(Integer, ForeignKey("geo_datasets.id"), nullable=False)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)