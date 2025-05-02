import React from "react";
import { UserGroupIcon, MapIcon } from "@heroicons/react/24/outline";

interface TopBarProps {
  patientsCount: number;
  locationsCount: number;
}

const TopBar: React.FC<TopBarProps> = ({ patientsCount, locationsCount }) => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">GeoFHIR</h1>
            <p className="mt-1 text-sm text-gray-500">
              Analyze geographic patterns in healthcare data using FHIR
              standards
            </p>
          </div>

          <div>
            <div className="flex space-x-4">
              <div className="flex items-center text-sm">
                <UserGroupIcon className="h-5 w-5 text-primary-600 mr-1" />
                <span className="font-medium">{patientsCount}</span> Patients
              </div>
              <div className="flex items-center text-sm">
                <MapIcon className="h-5 w-5 text-primary-600 mr-1" />
                <span className="font-medium">{locationsCount}</span> Locations
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;