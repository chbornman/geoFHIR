import React, { useState, useEffect } from "react";
import MapViewer from "./MapViewer";
import PatientList, { FHIRPatient } from "../fhir/PatientList";
import { ExclamationTriangleIcon, DocumentArrowUpIcon } from "@heroicons/react/24/outline";
import { fetchPatientObservations } from "../../services/api";

interface MapViewerTabProps {
  patients: FHIRPatient[];
  markers: Array<{ position: { lat: number; lng: number }; title: string }>;
  loading: boolean;
  error: string | null;
}

const MapViewerTab: React.FC<MapViewerTabProps> = ({
  patients,
  markers,
  loading,
  error
}) => {
  const [selectedPatient, setSelectedPatient] = useState<FHIRPatient | null>(null);
  const [observations, setObservations] = useState<any[]>([]);
  const [obsLoading, setObsLoading] = useState(false);

  // Function to get patient coordinates
  const getPatientCoordinates = (
    patient: FHIRPatient,
  ): { lat: number; lng: number } | null => {
    if (!patient.address || patient.address.length === 0) return null;

    const address = patient.address[0];
    if (!address.extension) return null;

    const geoExtension = address.extension.find(
      (ext) =>
        ext.url === "http://hl7.org/fhir/StructureDefinition/geolocation",
    );

    if (!geoExtension || !geoExtension.extension) return null;

    const latitude = geoExtension.extension.find(
      (ext) => ext.url === "latitude",
    )?.valueDecimal;
    const longitude = geoExtension.extension.find(
      (ext) => ext.url === "longitude",
    )?.valueDecimal;

    if (latitude === undefined || longitude === undefined) return null;

    return { lat: latitude, lng: longitude };
  };

  // Function to get patient name
  const getPatientName = (patient: FHIRPatient): string => {
    if (!patient.name || patient.name.length === 0) return "Unknown";

    const name = patient.name[0];
    const prefix = name.prefix ? name.prefix.join(" ") : "";
    const given = name.given ? name.given.join(" ") : "";
    const family = name.family || "";

    return `${prefix} ${given} ${family}`.trim();
  };

  // Handle patient selection
  const handlePatientSelect = (patient: FHIRPatient) => {
    setSelectedPatient(patient);
  };

  // Fetch observations when a patient is selected
  useEffect(() => {
    const loadObservations = async () => {
      if (selectedPatient) {
        setObsLoading(true);
        const obsData = await fetchPatientObservations(selectedPatient.id);
        setObservations(obsData);
        setObsLoading(false);
      } else {
        setObservations([]);
      }
    };
    loadObservations();
  }, [selectedPatient]);

  return (
    <>
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

      {patients.length === 0 ? (
        <div className="text-center py-8 bg-white shadow-sm rounded-lg">
          <DocumentArrowUpIcon className="h-12 w-12 text-primary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No patient data available
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Please use the "File Upload" tab to load patient data.
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
              <h2 className="text-xl font-bold text-gray-900">
                Kansas Patient Map
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                This map shows patient locations across Kansas. Click on a
                patient in the list to center the map.
              </p>
            </div>

            <MapViewer
              markers={markers}
              center={
                selectedPatient
                  ? getPatientCoordinates(selectedPatient) || undefined
                  : undefined
              }
            />

            {selectedPatient && (
              <>
                <div className="mt-4 bg-white shadow rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Selected Patient:
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getPatientName(selectedPatient)}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Gender:</span>{" "}
                      {selectedPatient.gender || "Unknown"}
                    </div>
                    <div>
                      <span className="font-medium">Birth Date:</span>{" "}
                      {selectedPatient.birthDate || "Unknown"}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Address:</span>{" "}
                      {selectedPatient.address &&
                        selectedPatient.address[0]?.line?.[0]}
                      ,
                      {selectedPatient.address &&
                        selectedPatient.address[0]?.city}
                      ,
                      {selectedPatient.address &&
                        selectedPatient.address[0]?.state}
                      {selectedPatient.address &&
                        selectedPatient.address[0]?.postalCode}
                    </div>
                  </div>
                </div>
                {/* Observations list for selected patient */}
                <div className="mt-4 bg-white shadow rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Observations
                  </h3>
                  {obsLoading ? (
                    <p className="text-sm text-gray-500">
                      Loading observations...
                    </p>
                  ) : observations.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No observations available.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2 text-sm">
                      {observations.map((obs) => {
                        const codeDisplay =
                          obs?.code?.text ||
                          obs?.code?.coding?.[0]?.display ||
                          obs?.code?.coding?.[0]?.code ||
                          "Unknown";
                        const value = obs?.valueQuantity?.value;
                        const unit = obs?.valueQuantity?.unit;
                        const effectiveDate =
                          obs?.effectiveDateTime || obs?.effectiveDate;
                        return (
                          <li key={obs.id} className="flex justify-between">
                            <div className="font-medium">{codeDisplay}</div>
                            <div>
                              {value !== undefined && unit
                                ? `${value} ${unit}`
                                : value !== undefined
                                  ? value
                                  : ""}
                            </div>
                            <div className="text-gray-500">
                              {effectiveDate
                                ? new Date(
                                    effectiveDate,
                                  ).toLocaleDateString()
                                : ""}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MapViewerTab;