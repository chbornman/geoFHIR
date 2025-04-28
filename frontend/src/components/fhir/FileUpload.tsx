import React, { useState, useRef } from 'react';
import { importFHIRData } from '../../services/api';
import { 
  DocumentArrowUpIcon, 
  ExclamationCircleIcon, 
  CheckCircleIcon, 
  ArrowPathIcon, 
  XMarkIcon, 
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if file is JSON
      if (!file.name.endsWith('.json') && !file.name.endsWith('.ndjson')) {
        setError('Only JSON or NDJSON files are supported');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);
    
    try {
      // Simulate progress for better UX (since we don't have real progress events)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + 5;
          return next < 90 ? next : prev;
        });
      }, 100);
      
      // Upload the file
      const result = await importFHIRData(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (result.status === 'success') {
        setSuccess(`${result.message}`);
        
        // Reset form after success
        setTimeout(() => {
          setSelectedFile(null);
          setSuccess(null);
          setUploadProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          // Notify parent component to refresh data
          onUploadSuccess();
        }, 3000);
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload FHIR Data
        </label>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>Select a FHIR JSON or NDJSON file to upload</span>
          <a
            href="/samples/sample_patients.json"
            download="sample_patients.json"
            className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium text-xs"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
            Download Sample File
          </a>
        </div>
        
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
          <div className="space-y-1 text-center">
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".json,.ndjson"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  disabled={isUploading}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              JSON or NDJSON up to 10MB
            </p>
          </div>
        </div>
        
        {selectedFile && (
          <div className="mt-2 flex items-center text-sm text-primary-600 bg-primary-50 p-2 rounded">
            <DocumentArrowUpIcon className="h-5 w-5 mr-1" />
            <span className="truncate">{selectedFile.name}</span>
            <span className="ml-1 text-xs text-gray-500">
              ({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
            <button 
              onClick={resetForm}
              type="button"
              className="ml-auto text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {error && (
          <div className="mt-2 flex items-center text-sm text-red-600 bg-red-50 p-2 rounded">
            <ExclamationCircleIcon className="h-5 w-5 mr-1" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mt-2 flex items-center text-sm text-green-600 bg-green-50 p-2 rounded">
            <CheckCircleIcon className="h-5 w-5 mr-1" />
            {success}
          </div>
        )}
        
        {isUploading && (
          <div className="mt-3">
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-primary-200">
                <div 
                  style={{ width: `${uploadProgress}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-600 transition-all duration-300"
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-1 inline-block">
                {uploadProgress}% Complete
              </span>
            </div>
          </div>
        )}
        
        <div className="mt-4 flex justify-between">
          <button
            type="button"
            className="btn btn-primary inline-flex items-center"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
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
            onClick={resetForm}
            disabled={isUploading || (!selectedFile && !error && !success)}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;