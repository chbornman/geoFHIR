import React, { useState, useEffect } from "react";
import Head from "next/head";
import TopBar from "../components/common/TopBar";
import NavTabs from "../components/common/NavTabs";
import DashboardTab from "../components/dashboard/DashboardTab";
import { FHIRPatient } from "../components/fhir/PatientList";
import { fetchPatients } from "../services/api";
import {
  ChartBarIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  const [patients, setPatients] = useState<FHIRPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<FHIRPatient | null>(
    null,
  );
  const [markers, setMarkers] = useState<
    Array<{ position: { lat: number; lng: number }; title: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    type: "success",
    text: "",
  });
  // Observations for selected patient
  const [observations, setObservations] = useState<any[]>([]);
  const [obsLoading, setObsLoading] = useState(false);

  // Show toast notification
  const showNotification = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

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

  // Upload panel open/closed state
  const [uploadOpen, setUploadOpen] = useState<boolean>(true);
  // Load sample patients
  const loadSampleData = async () => {
    setLoading(true);
    setError(null);

    try {
      // For demonstration, we'll manually load the patients from the sample data
      const response = await fetch("/api/sample-patients");
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
              title: getPatientName(patient),
            };
          })
          .filter(Boolean);

        setMarkers(newMarkers);

        showNotification(
          "success",
          `Loaded ${data.patients.length} patients with ${newMarkers.length} mappable locations`,
        );
      }
    } catch (err) {
      console.error("Error loading sample data:", err);
      setError("Failed to load sample data. Using fallback data instead.");

      // Fallback to hardcoded patient locations
      const fallbackMarkers = [
        { position: { lat: 39.0997, lng: -94.5786 }, title: "Kansas City" },
        { position: { lat: 37.6872, lng: -97.3301 }, title: "Wichita" },
        { position: { lat: 39.0558, lng: -95.6894 }, title: "Topeka" },
        { position: { lat: 38.8402, lng: -97.6114 }, title: "Salina" },
        { position: { lat: 38.9108, lng: -99.3125 }, title: "Hays" },
        { position: { lat: 37.0842, lng: -100.8584 }, title: "Liberal" },
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
              title: getPatientName(patient),
            };
          })
          .filter(Boolean);

        setMarkers(newMarkers);

        showNotification(
          "success",
          `Loaded ${patientsData.length} patients with ${newMarkers.length} mappable locations`,
        );
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to refresh data. Please upload a FHIR data file.");
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
      setMarkers((prevMarkers) => {
        // Keep all markers but highlight the selected one
        return prevMarkers.map((marker) => {
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
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>GeoFHIR - Healthcare Geographic Analysis</title>
        <meta
          name="description"
          content="Analyze geographic patterns in healthcare data using FHIR standards"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div
            className={`rounded-md p-4 shadow-lg ${
              toastMessage.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {toastMessage.type === "success" ? (
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
                      toastMessage.type === "success"
                        ? "bg-green-50 text-green-500 hover:bg-green-100"
                        : "bg-red-50 text-red-500 hover:bg-red-100"
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

      <TopBar patientsCount={patients.length} locationsCount={markers.length} />
      <NavTabs />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <DashboardTab 
            patientsCount={patients.length}
            locationsCount={markers.length}
          />
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
