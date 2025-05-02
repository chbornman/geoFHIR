import React, { useState, useEffect } from "react";
import { 
  Cog6ToothIcon, 
  ServerIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ArrowPathIcon 
} from "@heroicons/react/24/outline";
// Create an alias for DatabaseIcon since it might not be exported from Heroicons
import { CircleStackIcon as DatabaseIcon } from "@heroicons/react/24/outline";
import { 
  getCurrentSettings, 
  testDatabaseConnection, 
  testFHIRConnection, 
  getSystemHealth,
  DatabaseSettings,
  FHIRSettings,
  AppSettings
} from "../../services/api";

const SettingsTab: React.FC = () => {
  // State for settings
  const [currentSettings, setCurrentSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for database settings form
  const [dbSettings, setDbSettings] = useState<DatabaseSettings>({
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "",
    database: "geofhir"
  });
  
  // State for FHIR settings form
  const [fhirSettings, setFhirSettings] = useState<FHIRSettings>({
    server_url: "",
    use_external: false,
    username: "",
    password: ""
  });
  
  // State for test results
  const [dbTestResult, setDbTestResult] = useState<any>(null);
  const [dbTesting, setDbTesting] = useState(false);
  const [fhirTestResult, setFhirTestResult] = useState<any>(null);
  const [fhirTesting, setFhirTesting] = useState(false);
  
  // State for system health
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Load current settings on component mount
  useEffect(() => {
    loadSettings();
    checkSystemHealth();
    
    // Set up periodic health checks
    const healthInterval = setInterval(checkSystemHealth, 30000); // Check health every 30 seconds
    
    return () => {
      clearInterval(healthInterval);
    };
  }, []);

  // Function to load current settings
  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const settings = await getCurrentSettings().catch(() => null);
      
      if (settings) {
        setCurrentSettings(settings);
        
        // Update form states with current values
        if (settings.database) {
          setDbSettings({
            host: settings.database.host || "localhost",
            port: settings.database.port || 5432,
            username: settings.database.username || "postgres",
            password: "", // Don't populate password for security reasons
            database: settings.database.database || "geofhir"
          });
        }
        
        if (settings.fhir) {
          setFhirSettings({
            server_url: settings.fhir.server_url || "",
            use_external: settings.fhir.use_external || false,
            username: settings.fhir.username || "",
            password: "" // Don't populate password for security reasons
          });
        }
      } else {
        // If settings couldn't be loaded, use default values
        console.log("Using default settings as current settings couldn't be loaded");
        // Keep the defaults that were set in useState
      }
    } catch (err) {
      console.error("Error loading settings:", err);
      setError("Failed to load current settings. Using default values instead.");
    } finally {
      setLoading(false);
    }
  };

  // Function to check system health
  const checkSystemHealth = async () => {
    setHealthLoading(true);
    
    try {
      // getSystemHealth now handles errors internally and returns a default value
      const health = await getSystemHealth();
      setSystemHealth(health);
    } catch (err) {
      console.error("Error checking system health:", err);
      
      // Provide a fallback health status
      setSystemHealth({
        status: "unknown",
        services: {
          api: { 
            status: "degraded",
            message: "Could not connect to API"
          },
          database: { 
            status: "unknown" 
          },
          fhir: { 
            status: "unknown" 
          }
        }
      });
    } finally {
      setHealthLoading(false);
    }
  };

  // Function to test database connection
  const handleTestDbConnection = async () => {
    setDbTesting(true);
    setDbTestResult(null);
    
    try {
      const result = await testDatabaseConnection(dbSettings);
      setDbTestResult(result);
    } catch (err) {
      console.error("Error testing database connection:", err);
      setDbTestResult({
        status: "error",
        message: "Failed to test connection. Please check your settings."
      });
    } finally {
      setDbTesting(false);
    }
  };

  // Function to test FHIR connection
  const handleTestFhirConnection = async () => {
    setFhirTesting(true);
    setFhirTestResult(null);
    
    try {
      const result = await testFHIRConnection(fhirSettings);
      setFhirTestResult(result);
    } catch (err) {
      console.error("Error testing FHIR connection:", err);
      setFhirTestResult({
        status: "error",
        message: "Failed to test connection. Please check your settings."
      });
    } finally {
      setFhirTesting(false);
    }
  };

  // Handle form input changes for database settings
  const handleDbInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDbSettings(prev => ({
      ...prev,
      [name]: name === "port" ? parseInt(value) || 0 : value
    }));
  };

  // Handle form input changes for FHIR settings
  const handleFhirInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFhirSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center">
          <Cog6ToothIcon className="h-8 w-8 text-primary-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <p className="text-gray-500 mt-1">
              Configure database connections and application settings
            </p>
          </div>
        </div>
        
        {/* System Health Overview */}
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">System Health</h3>
            <button
              type="button"
              onClick={checkSystemHealth}
              className="flex items-center text-sm text-primary-600 hover:text-primary-700"
              disabled={healthLoading}
            >
              {healthLoading ? (
                <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <ArrowPathIcon className="h-4 w-4 mr-1" />
              )}
              Refresh
            </button>
          </div>
          
          {systemHealth ? (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* API Status */}
              <div className="bg-gray-50 rounded-md p-3 flex items-center">
                <ServerIcon className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">API</div>
                  <div className="flex items-center">
                    {systemHealth.services?.api?.status === "healthy" ? (
                      <>
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-700">Healthy</span>
                      </>
                    ) : systemHealth.services?.api?.status === "degraded" ? (
                      <>
                        <ExclamationCircleIcon className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-yellow-700">Degraded</span>
                      </>
                    ) : (
                      <>
                        <ExclamationCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-sm text-red-700">
                          {systemHealth.services?.api?.status || "Unknown"}
                        </span>
                      </>
                    )}
                  </div>
                  {systemHealth.services?.api?.message && (
                    <div className="text-xs text-gray-500 mt-1">
                      {systemHealth.services.api.message}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Database Status */}
              <div className="bg-gray-50 rounded-md p-3 flex items-center">
                <DatabaseIcon className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">Database</div>
                  <div className="flex items-center">
                    {systemHealth.services?.database?.status === "healthy" ? (
                      <>
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-700">Connected</span>
                      </>
                    ) : systemHealth.services?.database?.status === "not_configured" ? (
                      <>
                        <ExclamationCircleIcon className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-yellow-700">Not Configured</span>
                      </>
                    ) : (
                      <>
                        <ExclamationCircleIcon className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm text-gray-700">
                          {systemHealth.services?.database?.status || "Unknown"}
                        </span>
                      </>
                    )}
                  </div>
                  {systemHealth.services?.database?.message && (
                    <div className="text-xs text-gray-500 mt-1">
                      {systemHealth.services.database.message}
                    </div>
                  )}
                </div>
              </div>
              
              {/* FHIR Status */}
              <div className="bg-gray-50 rounded-md p-3 flex items-center">
                <ServerIcon className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">FHIR Server</div>
                  <div className="flex items-center">
                    {systemHealth.services?.fhir?.status === "healthy" ? (
                      <>
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-700">Connected</span>
                      </>
                    ) : systemHealth.services?.fhir?.status === "not_configured" ? (
                      <>
                        <ExclamationCircleIcon className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-yellow-700">Not Configured</span>
                      </>
                    ) : (
                      <>
                        <ExclamationCircleIcon className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm text-gray-700">
                          {systemHealth.services?.fhir?.status || "Unknown"}
                        </span>
                      </>
                    )}
                  </div>
                  {systemHealth.services?.fhir?.message && (
                    <div className="text-xs text-gray-500 mt-1">
                      {systemHealth.services.fhir.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : healthLoading ? (
            <p className="mt-2 text-gray-500 text-sm">Loading health information...</p>
          ) : (
            <div className="mt-2 flex items-center text-sm text-red-600">
              <ExclamationCircleIcon className="h-5 w-5 mr-1 flex-shrink-0" />
              <span>Unable to retrieve system health information. Please check your API connection.</span>
              <button 
                className="ml-3 text-primary-600 hover:text-primary-700"
                onClick={checkSystemHealth}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Database Connection Settings */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center mb-4">
          <DatabaseIcon className="h-6 w-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Database Connection</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="host" className="block text-sm font-medium text-gray-700">
              Host
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="host"
                id="host"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={dbSettings.host}
                onChange={handleDbInputChange}
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="port" className="block text-sm font-medium text-gray-700">
              Port
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="port"
                id="port"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={dbSettings.port}
                onChange={handleDbInputChange}
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="username"
                id="username"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={dbSettings.username}
                onChange={handleDbInputChange}
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                type="password"
                name="password"
                id="password"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={dbSettings.password}
                onChange={handleDbInputChange}
                placeholder="Enter password"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="database" className="block text-sm font-medium text-gray-700">
              Database Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="database"
                id="database"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={dbSettings.database}
                onChange={handleDbInputChange}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-5 flex justify-between items-center">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={handleTestDbConnection}
            disabled={dbTesting}
          >
            {dbTesting ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </button>
          
          <div className="text-sm">
            {dbTestResult && (
              <div className={`flex items-center ${
                dbTestResult.status === "success" ? "text-green-700" : "text-red-700"
              }`}>
                {dbTestResult.status === "success" ? (
                  <CheckCircleIcon className="h-5 w-5 mr-1" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5 mr-1" />
                )}
                {dbTestResult.message}
              </div>
            )}
          </div>
        </div>
        
        {dbTestResult && dbTestResult.status === "success" && dbTestResult.details && (
          <div className="mt-3 bg-gray-50 rounded-md p-3 text-sm">
            <div><strong>PostgreSQL Version:</strong> {dbTestResult.details.database_version?.split(",")[0]}</div>
            {dbTestResult.details.postgis_version && (
              <div><strong>PostGIS Version:</strong> {dbTestResult.details.postgis_version}</div>
            )}
          </div>
        )}
      </div>
      
      {/* FHIR Server Settings */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center mb-4">
          <ServerIcon className="h-6 w-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">FHIR Server</h3>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center">
            <input
              id="use_external"
              name="use_external"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={fhirSettings.use_external}
              onChange={handleFhirInputChange}
            />
            <label htmlFor="use_external" className="ml-2 block text-sm text-gray-900">
              Use external FHIR server (if unchecked, data is stored locally)
            </label>
          </div>
        </div>
        
        {fhirSettings.use_external && (
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="server_url" className="block text-sm font-medium text-gray-700">
                FHIR Server URL
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="server_url"
                  id="server_url"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={fhirSettings.server_url}
                  onChange={handleFhirInputChange}
                  placeholder="https://hapi.fhir.org/baseR4"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username (Optional)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="username"
                  id="fhir_username"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={fhirSettings.username}
                  onChange={handleFhirInputChange}
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password (Optional)
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="password"
                  id="fhir_password"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={fhirSettings.password}
                  onChange={handleFhirInputChange}
                  placeholder="Enter password"
                />
              </div>
            </div>
          </div>
        )}
        
        {fhirSettings.use_external && (
          <div className="mt-5 flex justify-between items-center">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={handleTestFhirConnection}
              disabled={fhirTesting || !fhirSettings.server_url}
            >
              {fhirTesting ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </button>
            
            <div className="text-sm">
              {fhirTestResult && (
                <div className={`flex items-center ${
                  fhirTestResult.status === "success" ? "text-green-700" : "text-red-700"
                }`}>
                  {fhirTestResult.status === "success" ? (
                    <CheckCircleIcon className="h-5 w-5 mr-1" />
                  ) : (
                    <ExclamationCircleIcon className="h-5 w-5 mr-1" />
                  )}
                  {fhirTestResult.message}
                </div>
              )}
            </div>
          </div>
        )}
        
        {fhirTestResult && fhirTestResult.status === "success" && fhirTestResult.details && (
          <div className="mt-3 bg-gray-50 rounded-md p-3 text-sm">
            <div><strong>FHIR Version:</strong> {fhirTestResult.details.fhir_version}</div>
          </div>
        )}
      </div>
      
      {/* Environment Info */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Cog6ToothIcon className="h-6 w-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Environment Information</h3>
        </div>
        
        <div className="overflow-hidden bg-gray-50 rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Environment</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {currentSettings?.environment || "development"}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">API URL</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Version</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  GeoFHIR v0.1.0
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;