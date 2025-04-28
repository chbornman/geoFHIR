from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.base import SessionLocal
from app.services.fhir_service import FHIRService

router = APIRouter(prefix="/fhir", tags=["fhir"])

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/import")
def import_fhir_data():
    """Import FHIR resources to the system"""
    return {"message": "FHIR data import endpoint"}

@router.get("/patients")
def get_patients():
    """Get patient data from the system"""
    return {"message": "Patients endpoint"}
