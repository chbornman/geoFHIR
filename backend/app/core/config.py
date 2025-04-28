import os
from typing import Any, Dict, Optional
from pydantic import PostgresDsn, field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    
    # Database settings
    DATABASE_URL: Optional[PostgresDsn] = None
    
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