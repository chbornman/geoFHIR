import React from "react";
import Head from "next/head";
import TopBar from "../components/common/TopBar";
import NavTabs from "../components/common/NavTabs";
import SettingsTab from "../components/settings/SettingsTab";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>GeoFHIR - Settings</title>
        <meta
          name="description"
          content="Configure database and application settings"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <TopBar patientsCount={0} locationsCount={0} />
      <NavTabs />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <SettingsTab />
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