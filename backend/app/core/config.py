import os
from typing import Any, Dict, Optional
from pydantic import PostgresDsn, field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    
    # Database settings
    DATABASE_URL: Optional[PostgresDsn] = None
    POSTGIS_SRID: int = 4326  # WGS84 coordinate system (standard for GPS)
    
    # PostGIS specific settings
    POSTGIS_HOST: Optional[str] = os.getenv("POSTGIS_HOST", "localhost")
    POSTGIS_PORT: Optional[int] = int(os.getenv("POSTGIS_PORT", "5432"))
    POSTGIS_USER: Optional[str] = os.getenv("POSTGIS_USER", "postgres")
    POSTGIS_PASSWORD: Optional[str] = os.getenv("POSTGIS_PASSWORD", "postgres")
    POSTGIS_DB: Optional[str] = os.getenv("POSTGIS_DB", "geofhir")
    
    @field_validator("DATABASE_URL", mode="before")
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        
        # If DATABASE_URL is not set, build it from individual components
        user = values.get("POSTGIS_USER")
        password = values.get("POSTGIS_PASSWORD")
        host = values.get("POSTGIS_HOST")
        port = values.get("POSTGIS_PORT")
        db = values.get("POSTGIS_DB")
        
        if all([user, password, host, port, db]):
            return f"postgresql://{user}:{password}@{host}:{port}/{db}"
        return v
    
    # FHIR settings
    FHIR_SERVER_URL: Optional[str] = None
    FHIR_SERVER_USERNAME: Optional[str] = None
    FHIR_SERVER_PASSWORD: Optional[str] = None
    USE_EXTERNAL_FHIR_SERVER: bool = False
    
    # Google Maps API
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    
    class Config:
        env_file = "../../../.env"  # Path to the top-level .env file
        case_sensitive = True

settings = Settings()