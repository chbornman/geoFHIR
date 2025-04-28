import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import Optional, List

from app.db.base import SessionLocal
from app.services.fhir_service import FHIRService

router = APIRouter(prefix="/fhir", tags=["fhir"])
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

@router.post("/import/file")
async def import_fhir_file(file: UploadFile = File(...)):
    """
    Import FHIR resources from an uploaded file
    
    Accepts a JSON file containing:
    - Single FHIR resource
    - Array of FHIR resources
    - FHIR Bundle
    """
    # Create uploads directory if it doesn't exist
    upload_dir = os.path.join(os.getcwd(), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save the uploaded file
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Process the file
    result = fhir_service.import_fhir_file(file_path)
    
    # Clean up - remove file after processing
    os.remove(file_path)
    
    return result

@router.get("/patients")
def get_patients():
    """Get all patient data"""
    patients = fhir_service.get_patients()
    return {"patients": patients, "count": len(patients)}

@router.get("/patients/{patient_id}/observations")
def get_patient_observations(patient_id: str):
    """Get observations for a specific patient"""
    observations = fhir_service.get_patient_observations(patient_id)
    return {"observations": observations, "count": len(observations)}

@router.get("/locations")
def get_locations():
    """Get all location data"""
    locations = fhir_service.get_locations()
    return {"locations": locations, "count": len(locations)}
