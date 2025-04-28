import React from 'react';

interface Patient {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  conditions: string[];
}

interface PatientListProps {
  patients: Patient[];
  onPatientSelect: (patient: Patient) => void;
}

const PatientList: React.FC<PatientListProps> = ({ patients, onPatientSelect }) => {
  return (
    <div className="patient-list">
      <h2>Patients</h2>
      <ul>
        {patients.map((patient) => (
          <li key={patient.id} onClick={() => onPatientSelect(patient)}>
            {patient.name} - {patient.conditions.join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatientList;