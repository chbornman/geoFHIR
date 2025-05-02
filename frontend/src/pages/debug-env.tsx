import React from 'react';
import NavTabs from '../components/common/NavTabs';

const DebugEnv: React.FC = () => {
  return (
    <>
      <NavTabs />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Environment Debug</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <pre className="bg-gray-800 text-white p-4 rounded overflow-auto">
          {JSON.stringify({
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'not set',
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'not set',
            NODE_ENV: process.env.NODE_ENV || 'not set',
          }, null, 2)}
        </pre>
      </div>
      
      <div className="mt-4 bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Browser Info</h2>
        <div className="bg-gray-800 text-white p-4 rounded overflow-auto">
          <p>Current URL: <span id="currentUrl">Only available on client</span></p>
          <p>Window Origin: <span id="windowOrigin">Only available on client</span></p>
        </div>
      </div>
      
      <div className="mt-4">
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            fetch('http://localhost:8000/health')
              .then(res => res.json())
              .then(data => {
                alert(JSON.stringify(data, null, 2));
              })
              .catch(err => {
                alert(`Error: ${err.message}`);
              });
          }}
        >
          Test API Connection
        </button>
      </div>
    </div>
    </>
  );
};

// Add client-side only code
DebugEnv.getInitialProps = async () => {
  return {};
};

export default DebugEnv;