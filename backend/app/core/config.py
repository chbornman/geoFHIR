import os
from typing import Any, Dict, Optional
from pydantic import PostgresDsn, field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    
    # Database settings
    DATABASE_URL: PostgresDsn
    
    # FHIR settings
    FHIR_SERVER_URL: str
    FHIR_SERVER_USERNAME: Optional[str] = None
    FHIR_SERVER_PASSWORD: Optional[str] = None
    
    # Google Maps API
    GOOGLE_MAPS_API_KEY: str
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()