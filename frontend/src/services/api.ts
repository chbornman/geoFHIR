import axios from 'axios';
import { FHIRPatient } from '../components/fhir/PatientList';

// In the browser (client-side), we need to use the browser's origin
// Server-side, we use the Docker network service name
const isClient = typeof window !== 'undefined';
const apiBaseUrl = isClient 
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') // Use API URL in browser
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

// Configure axios
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent long waiting periods
  timeout: 10000,
});

console.log('API URL:', apiBaseUrl);

// Connection status type
export type ConnectionStatus = {
  connected: boolean;
  lastChecked: Date;
  message?: string;
};

export const fetchPatients = async (): Promise<FHIRPatient[]> => {
  try {
    // Use the full API path with v1 prefix
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

export const checkApiConnection = async (): Promise<ConnectionStatus> => {
  try {
    const startTime = Date.now();
    
    // Debug info
    if (process.env.NODE_ENV === 'development') {
      console.log('Checking API health at URL:', `${apiBaseUrl}/health`);
    }
    
    // Use the root health check endpoint which is more reliable
    const response = await api.get('/health', { 
      timeout: 5000,
      // Prevent caching
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      connected: response.status === 200,
      lastChecked: new Date(),
      message: `Connected (${responseTime}ms)`
    };
  } catch (error: any) {
    // More detailed error reporting
    const errorCode = error?.code || 'UNKNOWN';
    const errorMsg = error?.message || 'Unknown error';
    
    console.error(`API connection check failed (${errorCode}):`, error);
    
    return {
      connected: false,
      lastChecked: new Date(),
      message: `Connection failed: ${errorCode}`
    };
  }
};

export default api;