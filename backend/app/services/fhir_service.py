from fhirclient import client
from fhirclient.models import patient, observation, location

from app.core.config import settings

class FHIRService:
    def __init__(self):
        self.smart = client.FHIRClient(
            settings={
                'app_id': 'geofhir',
                'api_base': settings.FHIR_SERVER_URL,
                # Authentication settings would be added here
            }
        )
    
    def get_patients(self):
        """Get patient resources from the FHIR server"""
        search = patient.Patient.where(struct={'_count': 100})
        patients = search.perform_resources(self.smart.server)
        return patients
    
    def get_patient_observations(self, patient_id):
        """Get observations for a specific patient"""
        search = observation.Observation.where(struct={
            'subject': f'Patient/{patient_id}',
            '_count': 100
        })
        observations = search.perform_resources(self.smart.server)
        return observations
    
    def get_locations(self):
        """Get location resources from the FHIR server"""
        search = location.Location.where(struct={'_count': 100})
        locations = search.perform_resources(self.smart.server)
        return locations