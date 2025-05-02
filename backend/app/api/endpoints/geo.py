from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
import json

from app.db.base import SessionLocal
from app.services.geo_service import GeoService
from app.services.fhir_service import FHIRService

router = APIRouter(prefix="/geo", tags=["geo"])
geo_service = GeoService()
fhir_service = FHIRService()

# Dependency
def get_db():
    try:
        db = SessionLocal()
        try:
            yield db
        finally:
            if hasattr(db, 'close'):
                db.close()
    except Exception as e:
        # Return None if DB connection fails
        yield None

@router.post("/import/geojson")
async def import_geojson(
    file: UploadFile = File(...),
    name: str = Form(...),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Import GeoJSON data to PostGIS database
    
    - **file**: GeoJSON file to upload
    - **name**: Name for the dataset
    - **description**: Optional description
    """
    if not file.filename.lower().endswith(('.json', '.geojson')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only GeoJSON files are supported"
        )
    
    # Read file content
    file_content = await file.read()
    
    # Check if it's valid JSON
    try:
        # Just to verify it's valid JSON
        json.loads(file_content)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON format"
        )
    
    # Process GeoJSON
    result = geo_service.load_geojson_data(
        db=db,
        file_content=file_content,
        filename=file.filename,
        dataset_name=name,
        description=description
    )
    
    if result.get("status") != "success":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to import GeoJSON data")
        )
    
    return result

@router.get("/datasets")
def get_datasets(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get list of all available GeoJSON datasets
    """
    datasets = geo_service.get_datasets(db, skip, limit)
    
    return {
        "total": len(datasets),
        "datasets": [
            {
                "id": dataset.id,
                "name": dataset.name,
                "description": dataset.description,
                "created_at": dataset.created_at,
                "updated_at": dataset.updated_at
            }
            for dataset in datasets
        ]
    }

@router.get("/datasets/{dataset_id}")
def get_dataset(dataset_id: int, db: Session = Depends(get_db)):
    """
    Get dataset details
    """
    dataset = geo_service.get_dataset(db, dataset_id)
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    return {
        "id": dataset.id,
        "name": dataset.name,
        "description": dataset.description,
        "source": dataset.source,
        "original_filename": dataset.original_filename,
        "metadata": dataset.metadata,
        "created_at": dataset.created_at,
        "updated_at": dataset.updated_at
    }

@router.get("/datasets/{dataset_id}/geojson")
def get_dataset_geojson(dataset_id: int, db: Session = Depends(get_db)):
    """
    Get GeoJSON features for a dataset
    """
    result = geo_service.get_dataset_features(db, dataset_id)
    
    if result.get("status") != "success":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message", "Failed to get dataset features")
        )
    
    # Return the GeoJSON directly (without the status/message wrapper)
    return result.get("geojson")

@router.post("/analyze")
def analyze_spatial_correlation(
    dataset_id: int = Query(..., description="ID of the dataset to analyze against"),
    buffer_distance: float = Query(1000, description="Buffer distance in meters"),
    db: Session = Depends(get_db)
):
    """
    Analyze spatial correlation between patient locations and GeoJSON features
    
    Uses the patient data from the FHIR service and analyzes it against a specific GeoJSON dataset.
    
    - **dataset_id**: ID of the GeoJSON dataset to analyze against
    - **buffer_distance**: Buffer distance in meters (default: 1000)
    """
    # First, check if dataset exists
    dataset = geo_service.get_dataset(db, dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Get all patient data
    patients = fhir_service.get_patients()
    
    # Perform analysis
    result = geo_service.analyze_spatial_correlation(
        db=db,
        patient_data=patients,
        dataset_id=dataset_id,
        buffer_distance=buffer_distance
    )
    
    if result.get("status") != "success":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Analysis failed")
        )
    
    return result.get("result")