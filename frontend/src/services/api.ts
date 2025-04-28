import axios from 'axios';
import { FHIRPatient } from '../components/fhir/PatientList';

// Configure axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchPatients = async (): Promise<FHIRPatient[]> => {
  try {
    const response = await api.get('/api/v1/fhir/patients');
    return response.data.patients || [];
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
};

export const fetchPatientObservations = async (patientId: string) => {
  try {
    const response = await api.get(`/api/v1/fhir/patients/${patientId}/observations`);
    return response.data.observations || [];
  } catch (error) {
    console.error(`Error fetching observations for patient ${patientId}:`, error);
    return [];
  }
};

export const fetchLocations = async () => {
  try {
    const response = await api.get('/api/v1/fhir/locations');
    return response.data.locations || [];
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
};

export const importFHIRData = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/v1/fhir/import/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error importing FHIR data:', error);
    throw error;
  }
};

export default api;