from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import time

from app.api.endpoints import fhir
from app.core.config import settings

app = FastAPI(
    title="GeoFHIR API",
    description="API for analyzing geographic patterns in healthcare data using FHIR standards",
    version="0.1.0"
)

# Get frontend URL from environment variable or use default
frontend_url = os.environ.get("NEXT_PUBLIC_FRONTEND_URL", "http://localhost:3000")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,                   # From environment variable
        "http://localhost:3000",        # Local development frontend
        "http://localhost",             # Docker/container access
        "http://frontend:3000",         # Docker service name
        "http://127.0.0.1:3000",        # Local IP access
    ],  
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Type", "X-API-Version"]
)

# Create uploads directory if it doesn't exist
uploads_dir = os.path.join(os.getcwd(), "uploads")
os.makedirs(uploads_dir, exist_ok=True)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to GeoFHIR API",
        "status": "online",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "health_check": "/api/v1/fhir/health"
    }

@app.get("/health")
def health_check():
    """Simple health check endpoint that doesn't require authentication"""
    return {
        "status": "healthy",
        "service": "geoFHIR API",
        "timestamp": time.time()
    }

@app.get("/api/v1/status")
def api_status():
    """API status endpoint that's easy to access from the frontend"""
    return {
        "status": "online",
        "service": "geoFHIR API",
        "version": "0.1.0",
        "timestamp": time.time()
    }

@app.get("/debug")
def debug_info():
    """Debug endpoint to verify connectivity and configuration"""
    return {
        "status": "ok",
        "time": time.time(),
        "cors_allowed_origins": app.user_middleware[0].options.get("allow_origins", []),
        "environment": {
            "frontend_url": os.environ.get("NEXT_PUBLIC_FRONTEND_URL", "not set"),
            "host": os.environ.get("HOSTNAME", "unknown"),
        }
    }

# Include routers
app.include_router(fhir.router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)