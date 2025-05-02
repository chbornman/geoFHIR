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

// GeoJSON API endpoints
export const fetchGeoDatasets = async () => {
  try {
    const response = await api.get('/api/v1/geo/datasets');
    return response.data || { datasets: [], total: 0 };
  } catch (error) {
    console.error('Error fetching geo datasets:', error);
    return { datasets: [], total: 0 };
  }
};

export const fetchGeoDatasetDetails = async (datasetId: number) => {
  try {
    const response = await api.get(`/api/v1/geo/datasets/${datasetId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching geo dataset ${datasetId}:`, error);
    throw error;
  }
};

export const fetchGeoDatasetGeoJSON = async (datasetId: number) => {
  try {
    const response = await api.get(`/api/v1/geo/datasets/${datasetId}/geojson`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching GeoJSON for dataset ${datasetId}:`, error);
    throw error;
  }
};

export const uploadGeoJSONFile = async (file: File, name: string, description?: string) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    
    if (description) {
      formData.append('description', description);
    }
    
    const response = await api.post('/api/v1/geo/import/geojson', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading GeoJSON file:', error);
    throw error;
  }
};

export const analyzeSpatialCorrelation = async (datasetId: number, bufferDistance: number = 1000) => {
  try {
    const response = await api.post(`/api/v1/geo/analyze?dataset_id=${datasetId}&buffer_distance=${bufferDistance}`);
    return response.data;
  } catch (error) {
    console.error('Error analyzing spatial correlation:', error);
    throw error;
  }
};

// Settings API endpoints
export interface DatabaseSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface FHIRSettings {
  server_url?: string;
  use_external: boolean;
  username?: string;
  password?: string;
}

export interface AppSettings {
  database: DatabaseSettings;
  fhir: FHIRSettings;
  environment?: string;
}

export const getCurrentSettings = async (): Promise<AppSettings> => {
  try {
    const response = await api.get('/api/v1/settings/current');
    return response.data;
  } catch (error) {
    console.error('Error fetching current settings:', error);
    throw error;
  }
};

export const testDatabaseConnection = async (settings: DatabaseSettings) => {
  try {
    const response = await api.post('/api/v1/settings/database/test', settings);
    return response.data;
  } catch (error) {
    console.error('Error testing database connection:', error);
    throw error;
  }
};

export const testFHIRConnection = async (settings: FHIRSettings) => {
  try {
    const response = await api.post('/api/v1/settings/fhir/test', settings);
    return response.data;
  } catch (error) {
    console.error('Error testing FHIR connection:', error);
    throw error;
  }
};

export const getSystemHealth = async () => {
  try {
    // Try the settings-specific health endpoint first
    try {
      const response = await api.get('/api/v1/settings/health');
      return response.data;
    } catch (settingsError) {
      // Fall back to the root health endpoint if settings endpoint isn't available
      console.warn('Settings health endpoint not available, using root health endpoint');
      const rootResponse = await api.get('/health');
      
      // Transform the response to match the expected format
      return {
        status: rootResponse.data.status === "healthy" ? "healthy" : "degraded",
        services: {
          api: {
            status: "healthy",
            timestamp: rootResponse.data.timestamp
          },
          database: {
            status: "unknown"
          },
          fhir: {
            status: "unknown"
          }
        }
      };
    }
  } catch (error) {
    console.error('Error fetching system health:', error);
    // Return a default response instead of throwing to prevent UI errors
    return {
      status: "unknown",
      services: {
        api: { status: "unknown" },
        database: { status: "unknown" },
        fhir: { status: "unknown" }
      }
    };
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