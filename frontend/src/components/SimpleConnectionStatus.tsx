import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Simple direct connection check without any dependencies
const SimpleConnectionStatus: React.FC = () => {
  // Use client-side only rendering to avoid hydration issues
  const [isClient, setIsClient] = useState(false);
  const [status, setStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [message, setMessage] = useState('Checking API connection...');
  const router = useRouter();
  
  // Set isClient to true once component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    // Skip on server-side rendering
    if (!isClient) return;
    
    const checkConnection = async () => {
      // Get the API URL from environment or use default
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // Try multiple endpoints in order with the backend API URL
      const endpoints = [
        `${apiUrl}/health`,             // Health check endpoint
        `${apiUrl}/api/v1/status`,      // API status endpoint
        `${apiUrl}/debug`,              // Debug endpoint
      ];
      
      // Keep track of all errors
      let lastError: any = null;
      
      // Try each endpoint in order
      for (const endpoint of endpoints) {
        try {
          console.log('Checking connection to:', endpoint);
          
          const startTime = Date.now();
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
            },
            // Add CORS mode for debugging
            mode: 'cors',
            credentials: 'include',
          });
          
          const responseTime = Date.now() - startTime;
          
          if (response.ok) {
            // Success! We can stop trying
            setStatus('connected');
            setMessage(`API connected via ${endpoint} (${responseTime}ms)`);
            return;
          } else {
            // Keep track of the error but try the next endpoint
            lastError = { status: response.status, endpoint };
          }
        } catch (error: any) {
          // Keep track of the error but try the next endpoint
          console.error(`Connection to ${endpoint} failed:`, error);
          lastError = { message: error?.message, endpoint };
        }
      }
      
      // If we get here, all endpoints failed
      setStatus('failed');
      
      if (lastError?.status) {
        setMessage(`API error: ${lastError.status} (${lastError.endpoint})`);
      } else if (lastError?.message) {
        setMessage(`Connection failed: ${lastError.message}`);
      } else {
        setMessage('All connection attempts failed');
      }
    };
    
    // Check initially with a delay to let Next.js initialize
    const timer = setTimeout(() => {
      checkConnection();
    }, 1500);
    
    // Check periodically
    const interval = setInterval(checkConnection, 30000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isClient]); // Only run effect when isClient changes
  
  // If we're server-side rendering, show a minimal placeholder to avoid hydration issues
  if (!isClient) {
    return <div className="text-sm opacity-0">Loading status...</div>;
  }
  
  return (
    <div className="text-sm">
      <div className="flex items-center">
        {/* Status indicator */}
        <div 
          className={`w-3 h-3 rounded-full mr-2 ${
            status === 'checking' ? 'bg-yellow-400 animate-pulse' : 
            status === 'connected' ? 'bg-green-500' : 'bg-red-500'
          }`} 
        />
        
        {/* Status message */}
        <span className={
          status === 'checking' ? 'text-yellow-700' : 
          status === 'connected' ? 'text-green-700' : 'text-red-700'
        }>
          {message}
        </span>
      </div>
      
      {/* Display current URL in development mode */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-1">
          Page URL: {window.location.href}
        </div>
      )}
    </div>
  );
};

export default SimpleConnectionStatus;