import json
from typing import Dict, List, Optional, Union, Any
from pathlib import Path

from fhirclient import client
from fhirclient.models import patient, observation, location

from app.core.config import settings

class FHIRService:
    def __init__(self):
        self.use_server = settings.USE_EXTERNAL_FHIR_SERVER
        self.patients_cache = []
        self.observations_cache = []
        self.locations_cache = []
        
        if self.use_server and settings.FHIR_SERVER_URL:
            self.smart = client.FHIRClient(
                settings={
                    'app_id': 'geofhir',
                    'api_base': settings.FHIR_SERVER_URL,
                    # Authentication settings would be added here
                }
            )
        else:
            self.smart = None
    
    def get_patients(self):
        """Get patient resources"""
        if self.use_server and self.smart:
            search = patient.Patient.where(struct={'_count': 100})
            patients = search.perform_resources(self.smart.server)
            return patients
        else:
            return self.patients_cache
    
    def get_patient_observations(self, patient_id):
        """Get observations for a specific patient"""
        if self.use_server and self.smart:
            search = observation.Observation.where(struct={
                'subject': f'Patient/{patient_id}',
                '_count': 100
            })
            observations = search.perform_resources(self.smart.server)
            return observations
        else:
            return [obs for obs in self.observations_cache 
                   if obs.get("subject", {}).get("reference") == f"Patient/{patient_id}"]
    
    def get_locations(self):
        """Get location resources"""
        if self.use_server and self.smart:
            search = location.Location.where(struct={'_count': 100})
            locations = search.perform_resources(self.smart.server)
            return locations
        else:
            return self.locations_cache
            
    def import_fhir_file(self, file_path: str, resource_type: str = None):
        """Import FHIR resources from a JSON file"""
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
                
            if isinstance(data, dict):
                # Single resource
                resource_type = data.get('resourceType')
                if resource_type == 'Patient':
                    self.patients_cache.append(data)
                elif resource_type == 'Observation':
                    self.observations_cache.append(data)
                elif resource_type == 'Location':
                    self.locations_cache.append(data)
                return {"status": "success", "message": f"Imported 1 {resource_type} resource"}
                
            elif isinstance(data, list):
                # Bundle or array of resources
                counts = {"Patient": 0, "Observation": 0, "Location": 0, "Other": 0}
                
                # Check if it's a Bundle
                if isinstance(data[0], dict) and data[0].get('resourceType') == 'Bundle':
                    resources = data[0].get('entry', [])
                    for entry in resources:
                        res = entry.get('resource', {})
                        res_type = res.get('resourceType')
                        if res_type == 'Patient':
                            self.patients_cache.append(res)
                            counts['Patient'] += 1
                        elif res_type == 'Observation':
                            self.observations_cache.append(res)
                            counts['Observation'] += 1
                        elif res_type == 'Location':
                            self.locations_cache.append(res)
                            counts['Location'] += 1
                        else:
                            counts['Other'] += 1
                # Array of resources            
                else:
                    for res in data:
                        res_type = res.get('resourceType')
                        if res_type == 'Patient':
                            self.patients_cache.append(res)
                            counts['Patient'] += 1
                        elif res_type == 'Observation':
                            self.observations_cache.append(res)
                            counts['Observation'] += 1
                        elif res_type == 'Location':
                            self.locations_cache.append(res)
                            counts['Location'] += 1
                        else:
                            counts['Other'] += 1
                            
                return {
                    "status": "success", 
                    "message": f"Imported {sum(counts.values())} resources",
                    "details": counts
                }
                
            return {"status": "error", "message": "Invalid FHIR format"}
        except Exception as e:
            return {"status": "error", "message": str(e)}