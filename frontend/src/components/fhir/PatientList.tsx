import React from 'react';

// Define the Patient interface based on FHIR structure
export interface FHIRPatient {
  id: string;
  resourceType: string;
  name?: Array<{
    use?: string;
    family?: string;
    given?: string[];
    prefix?: string[];
  }>;
  gender?: string;
  birthDate?: string;
  address?: Array<{
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    extension?: Array<{
      url: string;
      extension?: Array<{
        url: string;
        valueDecimal?: number;
      }>;
    }>;
  }>;
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
  deceasedDateTime?: string;
}

interface PatientListProps {
  patients: FHIRPatient[];
  onPatientSelect: (patient: FHIRPatient) => void;
  selectedPatientId?: string;
}

const PatientList: React.FC<PatientListProps> = ({ 
  patients, 
  onPatientSelect,
  selectedPatientId 
}) => {
  // Function to get patient's full name
  const getPatientName = (patient: FHIRPatient): string => {
    if (!patient.name || patient.name.length === 0) return 'Unknown';
    
    const name = patient.name[0];
    const prefix = name.prefix ? name.prefix.join(' ') : '';
    const given = name.given ? name.given.join(' ') : '';
    const family = name.family || '';
    
    return `${prefix} ${given} ${family}`.trim();
  };

  // Function to get patient's address
  const getPatientAddress = (patient: FHIRPatient): string => {
    if (!patient.address || patient.address.length === 0) return 'No address on file';
    
    const address = patient.address[0];
    const line = address.line ? address.line.join(', ') : '';
    const city = address.city || '';
    const state = address.state || '';
    const postalCode = address.postalCode || '';
    
    return `${line}, ${city}, ${state} ${postalCode}`.trim();
  };

  // Function to get patient's coordinates
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

  return (
    <div className="card h-[500px] overflow-y-auto shadow-md">
      <div className="bg-primary-700 text-white p-4">
        <h2 className="text-xl font-semibold text-white">Patient List</h2>
        <p className="text-sm text-primary-100 mt-1">Click on a patient to view location</p>
      </div>
      
      <ul className="divide-y divide-gray-200">
        {patients.length === 0 ? (
          <li className="p-4 text-center text-gray-500">
            No patients available. Please load patient data first.
          </li>
        ) : (
          patients.map((patient) => {
            const coordinates = getPatientCoordinates(patient);
            const isSelected = patient.id === selectedPatientId;
            
            return (
              <li 
                key={patient.id} 
                className={`p-4 ${isSelected ? 'bg-primary-50 border-l-4 border-primary-500' : 'hover:bg-gray-50'} 
                ${coordinates ? 'cursor-pointer' : 'opacity-60'} transition-colors duration-150`}
                onClick={() => coordinates && onPatientSelect(patient)}
              >
                <div>
                  <div className="font-semibold text-gray-900">{getPatientName(patient)}</div>
                  <div className="text-sm text-gray-600">{getPatientAddress(patient)}</div>
                  
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`badge ${patient.gender === 'male' ? 'badge-blue' : 'badge-pink'}`}>
                      {patient.gender || 'Unknown'}
                    </span>
                    
                    <span className="badge badge-green">
                      {patient.birthDate || 'DOB Unknown'}
                    </span>
                    
                    {patient.deceasedDateTime && (
                      <span className="badge badge-red">Deceased</span>
                    )}
                    
                    {!coordinates && (
                      <span className="badge badge-yellow">No Coordinates</span>
                    )}
                  </div>
                </div>
                <div className="mt-2 border-t border-gray-100 pt-2"></div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};

export default PatientList;