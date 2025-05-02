import React from "react";
import Head from "next/head";
import TopBar from "../components/common/TopBar";
import NavTabs from "../components/common/NavTabs";
import FileUpload from "../components/fhir/FileUpload";

export default function FileUploadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>GeoFHIR - File Upload</title>
        <meta
          name="description"
          content="Upload FHIR and geographic data for analysis"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <TopBar patientsCount={0} locationsCount={0} />
      <NavTabs />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Data Upload
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Use this page to upload FHIR patient data and geographic information for analysis.
            </p>
            <FileUpload
              onUploadSuccess={() => {
                // Redirect to map viewer page after successful upload
                window.location.href = '/';
              }}
            />
          </div>
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