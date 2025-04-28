from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.api.endpoints import fhir
from app.core.config import settings

app = FastAPI(
    title="GeoFHIR API",
    description="API for analyzing geographic patterns in healthcare data using FHIR standards",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
uploads_dir = os.path.join(os.getcwd(), "uploads")
os.makedirs(uploads_dir, exist_ok=True)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to GeoFHIR API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

# Include routers
app.include_router(fhir.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)