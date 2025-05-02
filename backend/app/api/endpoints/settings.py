from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import os
import time

from app.db.base import get_db, engine, SessionLocal
from app.core.config import settings

router = APIRouter(prefix="/settings", tags=["settings"])

class DatabaseSettings(BaseModel):
    host: str = Field(..., description="PostgreSQL/PostGIS host")
    port: int = Field(..., description="PostgreSQL/PostGIS port")
    username: str = Field(..., description="Database username")
    password: str = Field(..., description="Database password")
    database: str = Field(..., description="Database name")

class FHIRSettings(BaseModel):
    server_url: Optional[str] = Field(None, description="FHIR server URL")
    use_external: bool = Field(False, description="Use external FHIR server")
    username: Optional[str] = Field(None, description="FHIR server username")
    password: Optional[str] = Field(None, description="FHIR server password")

class AppSettings(BaseModel):
    database: DatabaseSettings
    fhir: Optional[FHIRSettings] = None

@router.get("/current")
def get_current_settings():
    """Get current application settings"""
    return {
        "database": {
            "host": settings.POSTGIS_HOST,
            "port": settings.POSTGIS_PORT,
            "username": settings.POSTGIS_USER,
            "password": "**********" if settings.POSTGIS_PASSWORD else None,  # Don't return actual password
            "database": settings.POSTGIS_DB,
            "connection_string": str(settings.DATABASE_URL).replace(settings.POSTGIS_PASSWORD or "", "********") if settings.DATABASE_URL else None
        },
        "fhir": {
            "server_url": settings.FHIR_SERVER_URL,
            "use_external": settings.USE_EXTERNAL_FHIR_SERVER,
            "username": settings.FHIR_SERVER_USERNAME,
            "password": "**********" if settings.FHIR_SERVER_PASSWORD else None  # Don't return actual password
        },
        "environment": os.environ.get("ENVIRONMENT", "development")
    }

@router.post("/database/test")
def test_database_connection(db_settings: DatabaseSettings):
    """Test database connection with provided settings"""
    try:
        # Construct connection string
        connection_string = f"postgresql://{db_settings.username}:{db_settings.password}@{db_settings.host}:{db_settings.port}/{db_settings.database}"
        
        # Test connection
        test_engine = None
        try:
            from sqlalchemy import create_engine
            test_engine = create_engine(connection_string)
            
            # Try to execute a simple query
            with test_engine.connect() as conn:
                # Test if PostGIS is installed
                try:
                    result = conn.execute(text("SELECT PostGIS_Version()"))
                    postgis_version = result.scalar()
                except Exception:
                    postgis_version = None
                
                # Get database version
                result = conn.execute(text("SELECT version()"))
                db_version = result.scalar()
                
            return {
                "status": "success",
                "message": "Successfully connected to the database",
                "details": {
                    "database_version": db_version,
                    "postgis_version": postgis_version,
                    "timestamp": time.time()
                }
            }
        finally:
            if test_engine:
                test_engine.dispose()
                
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to connect to the database: {str(e)}",
            "details": {
                "timestamp": time.time()
            }
        }

@router.post("/fhir/test")
def test_fhir_connection(fhir_settings: FHIRSettings):
    """Test FHIR server connection with provided settings"""
    if not fhir_settings.server_url:
        return {
            "status": "error",
            "message": "FHIR server URL is required",
            "details": {
                "timestamp": time.time()
            }
        }
    
    try:
        import requests
        
        # Prepare authentication if provided
        auth = None
        if fhir_settings.username and fhir_settings.password:
            auth = (fhir_settings.username, fhir_settings.password)
        
        # Test connection
        response = requests.get(
            f"{fhir_settings.server_url}/metadata",
            auth=auth,
            timeout=5
        )
        
        if response.status_code == 200:
            # Try to parse the capability statement
            data = response.json()
            fhir_version = data.get("fhirVersion", "Unknown")
            
            return {
                "status": "success",
                "message": "Successfully connected to the FHIR server",
                "details": {
                    "fhir_version": fhir_version,
                    "server_url": fhir_settings.server_url,
                    "timestamp": time.time()
                }
            }
        else:
            return {
                "status": "error",
                "message": f"Failed to connect to the FHIR server: HTTP {response.status_code}",
                "details": {
                    "status_code": response.status_code,
                    "timestamp": time.time()
                }
            }
            
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to connect to the FHIR server: {str(e)}",
            "details": {
                "timestamp": time.time()
            }
        }

@router.get("/health")
def system_health():
    """Get overall system health status"""
    health_status = {
        "status": "healthy",
        "services": {
            "api": {
                "status": "healthy",
                "timestamp": time.time()
            },
            "database": {
                "status": "unknown"
            },
            "fhir": {
                "status": "unknown"
            }
        }
    }
    
    # Check database connection
    try:
        if engine:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            health_status["services"]["database"] = {
                "status": "healthy",
                "timestamp": time.time()
            }
        else:
            health_status["services"]["database"] = {
                "status": "not_configured",
                "timestamp": time.time()
            }
    except Exception as e:
        health_status["services"]["database"] = {
            "status": "unhealthy",
            "message": str(e),
            "timestamp": time.time()
        }
        health_status["status"] = "degraded"
    
    # Check FHIR server connection if configured
    if settings.USE_EXTERNAL_FHIR_SERVER and settings.FHIR_SERVER_URL:
        try:
            import requests
            
            # Prepare authentication if provided
            auth = None
            if settings.FHIR_SERVER_USERNAME and settings.FHIR_SERVER_PASSWORD:
                auth = (settings.FHIR_SERVER_USERNAME, settings.FHIR_SERVER_PASSWORD)
            
            # Test connection
            response = requests.get(
                f"{settings.FHIR_SERVER_URL}/metadata",
                auth=auth,
                timeout=3
            )
            
            if response.status_code == 200:
                health_status["services"]["fhir"] = {
                    "status": "healthy",
                    "timestamp": time.time()
                }
            else:
                health_status["services"]["fhir"] = {
                    "status": "unhealthy",
                    "message": f"HTTP {response.status_code}",
                    "timestamp": time.time()
                }
                health_status["status"] = "degraded"
        except Exception as e:
            health_status["services"]["fhir"] = {
                "status": "unhealthy",
                "message": str(e),
                "timestamp": time.time()
            }
            health_status["status"] = "degraded"
    else:
        health_status["services"]["fhir"] = {
            "status": "not_configured",
            "timestamp": time.time()
        }
    
    return health_status