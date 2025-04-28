import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import MapViewer from '../components/maps/MapViewer';
import PatientList, { FHIRPatient } from '../components/fhir/PatientList';
import FileUpload from '../components/fhir/FileUpload';
import SimpleConnectionStatus from '../components/SimpleConnectionStatus';
import { fetchPatients } from '../services/api';
import { Disclosure, Transition } from '@headlessui/react';
import { 
  ChartBarIcon, 
  MapIcon, 
  ChevronUpIcon, 
  UserGroupIcon,
  ExclamationTriangleIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const [patients, setPatients] = useState<FHIRPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<FHIRPatient | null>(null);
  const [markers, setMarkers] = useState<Array<{position: {lat: number, lng: number}, title: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: 'success', text: '' });

  // Show toast notification
  const showNotification = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Function to get patient coordinates
  const getPatientCoordinates = (patient: FHIRPatient): { lat: number, lng: number } | null => {
    if (!patient.address || patient.address.length === 0) return null;
    
    const address = patient.address[0];
    if (!address.extension) return null;
    
    const geoExtension = address.extension.find(ext => 
      ext.url === 'http://hl7.org/fhir/StructureDefinition/geolocation'
    );
    
    if (!geoExtension || !geoExtension.extension) return null;
    
    const latitude = geoExtension.extension.find(ext => ext.url === 'latitude')?.valueDecimal;
    const longitude = geoExtension.extension.find(ext => ext.url === 'longitude')?.valueDecimal;
    
    if (latitude === undefined || longitude === undefined) return null;
    
    return { lat: latitude, lng: longitude };
  };

  // Function to get patient name
  const getPatientName = (patient: FHIRPatient): string => {
    if (!patient.name || patient.name.length === 0) return 'Unknown';
    
    const name = patient.name[0];
    const prefix = name.prefix ? name.prefix.join(' ') : '';
    const given = name.given ? name.given.join(' ') : '';
    const family = name.family || '';
    
    return `${prefix} ${given} ${family}`.trim();
  };

  // Load sample patients
  const loadSampleData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For demonstration, we'll manually load the patients from the sample data
      const response = await fetch('/api/sample-patients');
      const data = await response.json();
      
      if (data.patients && data.patients.length > 0) {
        setPatients(data.patients);
        
        // Create markers for all patients with coordinates
        const newMarkers = data.patients
          .map((patient: FHIRPatient) => {
            const coords = getPatientCoordinates(patient);
            if (!coords) return null;
            
            return {
              position: coords,
              title: getPatientName(patient)
            };
          })
          .filter(Boolean);
        
        setMarkers(newMarkers);
        
        showNotification('success', `Loaded ${data.patients.length} patients with ${newMarkers.length} mappable locations`);
      }
    } catch (err) {
      console.error('Error loading sample data:', err);
      setError('Failed to load sample data. Using fallback data instead.');
      
      // Fallback to hardcoded patient locations
      const fallbackMarkers = [
        { position: { lat: 39.0997, lng: -94.5786 }, title: "Kansas City" },
        { position: { lat: 37.6872, lng: -97.3301 }, title: "Wichita" },
        { position: { lat: 39.0558, lng: -95.6894 }, title: "Topeka" },
        { position: { lat: 38.8402, lng: -97.6114 }, title: "Salina" },
        { position: { lat: 38.9108, lng: -99.3125 }, title: "Hays" },
        { position: { lat: 37.0842, lng: -100.8584 }, title: "Liberal" }
      ];
      
      setMarkers(fallbackMarkers);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh data after successful upload
  const refreshData = async () => {
    setLoading(true);
    try {
      const patientsData = await fetchPatients();
      if (patientsData.length > 0) {
        setPatients(patientsData);
        
        // Create markers for patients with coordinates
        const newMarkers = patientsData
          .map((patient) => {
            const coords = getPatientCoordinates(patient);
            if (!coords) return null;
            
            return {
              position: coords,
              title: getPatientName(patient)
            };
          })
          .filter(Boolean);
        
        setMarkers(newMarkers);
        
        showNotification('success', `Loaded ${patientsData.length} patients with ${newMarkers.length} mappable locations`);
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data. Please upload a FHIR data file.');
    } finally {
      setLoading(false);
    }
  };
  
  // Don't automatically load data on mount - let user upload a file first

  // Handle patient selection
  const handlePatientSelect = (patient: FHIRPatient) => {
    setSelectedPatient(patient);
    
    const coords = getPatientCoordinates(patient);
    if (coords) {
      // Update map to center on this patient
      setMarkers(prevMarkers => {
        // Keep all markers but highlight the selected one
        return prevMarkers.map(marker => {
          if (
            marker.position.lat === coords.lat && 
            marker.position.lng === coords.lng
          ) {
            // This is the selected patient's marker
            return { 
              ...marker, 
              // We could add additional properties here for highlighting
            };
          }
          return marker;
        });
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>GeoFHIR - Healthcare Geographic Analysis</title>
        <meta name="description" content="Analyze geographic patterns in healthcare data using FHIR standards" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div className={`rounded-md p-4 shadow-lg ${
            toastMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {toastMessage.type === 'success' ? (
                  <ChartBarIcon className="h-5 w-5 text-green-400" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{toastMessage.text}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    className={`inline-flex rounded-md p-1.5 ${
                      toastMessage.type === 'success' 
                        ? 'bg-green-50 text-green-500 hover:bg-green-100' 
                        : 'bg-red-50 text-red-500 hover:bg-red-100'
                    }`}
                    onClick={() => setShowToast(false)}
                  >
                    <span className="sr-only">Dismiss</span>
                    <ChevronUpIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-900">GeoFHIR</h1>
              <p className="mt-1 text-sm text-gray-500">
                Analyze geographic patterns in healthcare data using FHIR standards
              </p>
              <SimpleConnectionStatus />
            </div>
            
            <div>
              <div className="flex space-x-4">
                <div className="flex items-center text-sm">
                  <UserGroupIcon className="h-5 w-5 text-primary-600 mr-1" />
                  <span className="font-medium">{patients.length}</span> Patients
                </div>
                <div className="flex items-center text-sm">
                  <MapIcon className="h-5 w-5 text-primary-600 mr-1" />
                  <span className="font-medium">{markers.length}</span> Locations
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {error && (
            <div className="rounded-md bg-yellow-50 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Note</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* File Upload Panel */}
          <div className="mb-6">
            <Disclosure defaultOpen={true}>
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex w-full justify-between rounded-lg bg-primary-50 px-4 py-3 text-left text-sm font-medium text-primary-900 hover:bg-primary-100 focus:outline-none focus-visible:ring focus-visible:ring-primary-500">
                    <div className="flex items-center">
                      <DocumentArrowUpIcon className="h-5 w-5 mr-2 text-primary-500" />
                      <span>Upload FHIR Data</span>
                    </div>
                    <ChevronUpIcon
                      className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-primary-500`}
                    />
                  </Disclosure.Button>
                  <Transition
                    show={open}
                    enter="transition duration-100 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                  >
                    <Disclosure.Panel className="pt-4 pb-2 text-sm">
                      <FileUpload onUploadSuccess={refreshData} />
                    </Disclosure.Panel>
                  </Transition>
                </>
              )}
            </Disclosure>
          </div>
          
          {patients.length === 0 ? (
            <div className="text-center py-8 bg-white shadow-sm rounded-lg">
              <DocumentArrowUpIcon className="h-12 w-12 text-primary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No patient data available</h3>
              <p className="mt-2 text-sm text-gray-500">
                Please use the "Upload FHIR Data" panel above to load patient data.
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-1/3">
                <PatientList 
                  patients={patients} 
                  onPatientSelect={handlePatientSelect}
                  selectedPatientId={selectedPatient?.id}
                />
              </div>
              
              <div className="w-full lg:w-2/3">
                <div className="mb-3">
                  <h2 className="text-xl font-bold text-gray-900">Kansas Patient Map</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    This map shows patient locations across Kansas. Click on a patient in the list to center the map.
                  </p>
                </div>
                
                <MapViewer 
                  markers={markers} 
                  center={selectedPatient ? getPatientCoordinates(selectedPatient) || undefined : undefined}
                />
                
                {selectedPatient && (
                  <div className="mt-4 bg-white shadow rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900">Selected Patient:</h3>
                    <p className="text-sm text-gray-600">{getPatientName(selectedPatient)}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Gender:</span> {selectedPatient.gender || 'Unknown'}
                      </div>
                      <div>
                        <span className="font-medium">Birth Date:</span> {selectedPatient.birthDate || 'Unknown'}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Address:</span> {selectedPatient.address && selectedPatient.address[0]?.line?.[0]}, 
                        {selectedPatient.address && selectedPatient.address[0]?.city}, 
                        {selectedPatient.address && selectedPatient.address[0]?.state} 
                        {selectedPatient.address && selectedPatient.address[0]?.postalCode}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-center text-gray-500">
              &copy; {new Date().getFullYear()} GeoFHIR. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}