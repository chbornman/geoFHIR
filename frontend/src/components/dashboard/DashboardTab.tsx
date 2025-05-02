import React from "react";
import Link from "next/link";
import {
  MapIcon,
  DocumentArrowUpIcon,
  CommandLineIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import ConnectionStatus from "../ConnectionStatus";

interface DashboardTabProps {
  patientsCount: number;
  locationsCount: number;
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  patientsCount,
  locationsCount,
}) => {
  // Navigation card links
  const navigationCards = [
    {
      title: "Map Viewer",
      description: "Visualize patient data on interactive maps",
      icon: <MapIcon className="h-8 w-8 text-indigo-500" />,
      href: "/map-viewer",
      color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
      stats: `${locationsCount} locations`,
    },
    {
      title: "File Upload",
      description: "Import FHIR data and geographic information",
      icon: <DocumentArrowUpIcon className="h-8 w-8 text-green-500" />,
      href: "/file-upload",
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      stats: `${patientsCount} patients`,
    },
    {
      title: "Analytics",
      description: "View insights and trends from your data (Coming soon)",
      icon: <ChartBarIcon className="h-8 w-8 text-purple-500" />,
      href: "#",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      disabled: true,
      stats: null,
    },
    {
      title: "Patient Registry",
      description: "Search and manage patient records (Coming soon)",
      icon: <UserGroupIcon className="h-8 w-8 text-blue-500" />,
      href: "#",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      disabled: true,
      stats: null,
    },
    {
      title: "Population Health",
      description: "Analyze health trends by geography (Coming soon)",
      icon: <ArrowTrendingUpIcon className="h-8 w-8 text-amber-500" />,
      href: "#",
      color: "bg-amber-50 border-amber-200 hover:bg-amber-100",
      disabled: true,
      stats: null,
    },
    {
      title: "Debug Environment",
      description: "View system configuration and environment variables",
      icon: <CommandLineIcon className="h-8 w-8 text-gray-500" />,
      href: "/debug-env",
      color: "bg-gray-50 border-gray-200 hover:bg-gray-100",
      stats: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Stats */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome to GeoFHIR
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Analyze geographic patterns in healthcare data using FHIR standards
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <ConnectionStatus showLabel={true} />
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Patients
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {patientsCount}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MapIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Mapped Locations
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {locationsCount}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Patient Coverage
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {patientsCount > 0
                          ? `${Math.round((locationsCount / patientsCount) * 100)}%`
                          : "0%"}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {navigationCards.map((card) => (
          <div
            key={card.title}
            className={`relative rounded-lg border overflow-hidden ${
              card.color
            } ${card.disabled ? "opacity-60" : ""}`}
          >
            {card.disabled && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-gray-100 text-xs font-medium rounded text-gray-800">
                Coming Soon
              </div>
            )}
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">{card.icon}</div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {card.title}
                  </h3>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">{card.description}</p>
              </div>
              {card.stats && (
                <div className="mt-2 text-sm font-medium text-gray-900">
                  {card.stats}
                </div>
              )}
              <div className="mt-5">
                {card.disabled ? (
                  <span className="cursor-not-allowed inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-50">
                    Coming Soon
                  </span>
                ) : (
                  <Link
                    href={card.href}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Visit {card.title}
                    <svg
                      className="ml-2 -mr-1 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardTab;