import React, { useState, useRef } from "react";
import { importFHIRData } from "../../services/api";
import {
  DocumentArrowUpIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  MapIcon,
} from "@heroicons/react/24/outline";

interface FileUploadProps {
  onUploadSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  // Separate state for FHIR and GEO files
  const [fhirFiles, setFhirFiles] = useState<File[]>([]);
  const [geoFiles, setGeoFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'fhir' | 'geo' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Separate refs for each file input
  const fhirFileInputRef = useRef<HTMLInputElement>(null);
  const geoFileInputRef = useRef<HTMLInputElement>(null);

  // Handle FHIR file selection
  const handleFhirFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const invalid = fileArray.some(
        (f) => !f.name.endsWith(".json") && !f.name.endsWith(".ndjson"),
      );
      if (invalid) {
        setError("Only JSON or NDJSON files are supported for FHIR data");
        setFhirFiles([]);
        return;
      }
      setFhirFiles(fileArray);
      setError(null);
      setSuccess(null);
    }
  };

  // Handle GEO file selection
  const handleGeoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const invalid = fileArray.some(
        (f) => !f.name.endsWith(".json") && !f.name.endsWith(".geojson") && !f.name.endsWith(".zip"),
      );
      if (invalid) {
        setError("Only GeoJSON or Shapefile (ZIP) formats are supported for geographic data");
        setGeoFiles([]);
        return;
      }
      setGeoFiles(fileArray);
      setError(null);
      setSuccess(null);
    }
  };

  // Handle FHIR upload
  const handleFhirUpload = async () => {
    if (fhirFiles.length === 0) {
      setError("Please select one or more FHIR files first");
      return;
    }
    setIsUploading(true);
    setUploadType('fhir');
    setError(null);
    setSuccess(null);
    try {
      for (const file of fhirFiles) {
        const result = await importFHIRData(file);
        if (result.status !== "success") {
          setError(
            `Error uploading ${file.name}: ${result.message || "Upload failed"}`,
          );
          setIsUploading(false);
          setUploadType(null);
          return;
        }
      }
      // All uploads succeeded
      setSuccess(`Uploaded ${fhirFiles.length} FHIR file(s) successfully`);
      // Notify parent to refresh data and close panel
      onUploadSuccess();
      // Clear selected files
      resetFhirForm();
    } catch (err) {
      console.error("Error uploading FHIR files:", err);
      setError("Failed to upload FHIR files. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadType(null);
    }
  };

  // Handle GEO upload (placeholder for now)
  const handleGeoUpload = async () => {
    if (geoFiles.length === 0) {
      setError("Please select one or more geographic files first");
      return;
    }
    setIsUploading(true);
    setUploadType('geo');
    setError(null);
    setSuccess(null);
    try {
      // TODO: Implement actual geo data upload
      // Simulating upload for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(`Uploaded ${geoFiles.length} geographic file(s) successfully`);
      // Notify parent to refresh data and close panel
      onUploadSuccess();
      // Clear selected files
      resetGeoForm();
    } catch (err) {
      console.error("Error uploading geographic files:", err);
      setError("Failed to upload geographic files. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadType(null);
    }
  };

  // Reset FHIR form
  const resetFhirForm = () => {
    setFhirFiles([]);
    setError(null);
    setSuccess(null);
    if (fhirFileInputRef.current) {
      fhirFileInputRef.current.value = "";
    }
  };

  // Reset GEO form
  const resetGeoForm = () => {
    setGeoFiles([]);
    setError(null);
    setSuccess(null);
    if (geoFileInputRef.current) {
      geoFileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Data Uploader</h2>
      <p className="text-sm text-gray-500 mb-6">
        Upload FHIR patient data and geographic files to visualize on the map.
      </p>
      
      {/* Grid layout: 1 column on mobile, 2 columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FHIR Data Upload Panel */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
          <div className="flex items-center mb-3">
            <DocumentArrowUpIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-md font-medium text-gray-800">FHIR Data</h3>
          </div>
          
          <div className="text-xs text-gray-500 mb-4">
            Select a FHIR JSON or NDJSON file to upload
          </div>
          
          {/* File selection: multiple files */}
          <div className="flex items-center space-x-4 mb-3">
            <label
              htmlFor="fhir-file-upload"
              className="btn btn-secondary relative inline-flex items-center"
            >
              <input
                id="fhir-file-upload"
                name="fhir-file-upload"
                type="file"
                className="sr-only"
                accept=".json,.ndjson"
                multiple
                onChange={handleFhirFileChange}
                ref={fhirFileInputRef}
                disabled={isUploading}
              />
              <span>Select FHIR files</span>
            </label>
          </div>
          
          {fhirFiles.length > 0 && (
            <ul className="mt-2 text-sm text-gray-700 space-y-1 max-h-24 overflow-y-auto mb-3">
              {fhirFiles.map((file, idx) => (
                <li key={idx} className="flex justify-between">
                  <span className="truncate">{file.name}</span>
                  <span className="text-gray-500 ml-2 flex-shrink-0">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <div className="my-2 flex items-center text-sm text-red-600 bg-red-50 p-2 rounded">
              <ExclamationCircleIcon className="h-5 w-5 mr-1 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="my-2 flex items-center text-sm text-green-600 bg-green-50 p-2 rounded">
              <CheckCircleIcon className="h-5 w-5 mr-1 flex-shrink-0" />
              {success}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2 sm:justify-between">
            <button
              type="button"
              className="btn btn-primary inline-flex items-center"
              onClick={handleFhirUpload}
              disabled={fhirFiles.length === 0 || isUploading}
            >
              {isUploading && uploadType === 'fhir' ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                  Upload FHIR Data
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetFhirForm}
              disabled={isUploading || fhirFiles.length === 0}
            >
              Clear files
            </button>
          </div>
        </div>

        {/* Geo Data Upload Panel */}
        <div className="bg-green-50 border border-green-100 rounded-lg p-5">
          <div className="flex items-center mb-3">
            <MapIcon className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-md font-medium text-gray-800">Geographic Data</h3>
          </div>
          
          <div className="text-xs text-gray-500 mb-4">
            Select a GeoJSON or Shapefile to upload
          </div>
          
          {/* File selection: multiple files */}
          <div className="flex items-center space-x-4 mb-3">
            <label
              htmlFor="geo-file-upload"
              className="btn btn-secondary relative inline-flex items-center"
            >
              <input
                id="geo-file-upload"
                name="geo-file-upload"
                type="file"
                className="sr-only"
                accept=".json,.geojson,.zip"
                multiple
                onChange={handleGeoFileChange}
                ref={geoFileInputRef}
                disabled={isUploading}
              />
              <span>Select GEO files</span>
            </label>
          </div>
          
          {geoFiles.length > 0 && (
            <ul className="mt-2 text-sm text-gray-700 space-y-1 max-h-24 overflow-y-auto mb-3">
              {geoFiles.map((file, idx) => (
                <li key={idx} className="flex justify-between">
                  <span className="truncate">{file.name}</span>
                  <span className="text-gray-500 ml-2 flex-shrink-0">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <div className="my-2 flex items-center text-sm text-red-600 bg-red-50 p-2 rounded">
              <ExclamationCircleIcon className="h-5 w-5 mr-1 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="my-2 flex items-center text-sm text-green-600 bg-green-50 p-2 rounded">
              <CheckCircleIcon className="h-5 w-5 mr-1 flex-shrink-0" />
              {success}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2 sm:justify-between">
            <button
              type="button"
              className="btn btn-primary inline-flex items-center"
              onClick={handleGeoUpload}
              disabled={geoFiles.length === 0 || isUploading}
            >
              {isUploading && uploadType === 'geo' ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <MapIcon className="h-4 w-4 mr-2" />
                  Upload GEO Data
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetGeoForm}
              disabled={isUploading || geoFiles.length === 0}
            >
              Clear files
            </button>
          </div>
        </div>
      </div>
      
      {/* Common notifications */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Need sample data? <a href="#" className="text-primary-600 hover:text-primary-500">Click here</a> to load example files.</p>
      </div>
    </div>
  );
};

export default FileUpload;
