import React, { useState, useEffect } from 'react';
import { checkApiConnection, ConnectionStatus } from '../services/api';
import { CheckCircleIcon, ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

type Props = {
  className?: string;
};

const ConnectionStatusIndicator: React.FC<Props> = ({ className = '' }) => {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    lastChecked: new Date(),
    message: 'Checking connection...'
  });
  const [checking, setChecking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const checkConnection = async (isRetry = false) => {
    setChecking(true);
    try {
      const result = await checkApiConnection();
      setStatus(result);
      setErrorDetails(null);
      
      // Reset retry count on successful connection
      if (result.connected) {
        setRetryCount(0);
      } else if (isRetry) {
        // Increment retry count
        setRetryCount(prev => prev + 1);
      }
    } catch (error: any) {
      // Store error details for debugging
      setErrorDetails(error?.message || 'Unknown error');
    } finally {
      setChecking(false);
    }
  };

  // Auto retry on failure with exponential backoff
  useEffect(() => {
    if (!status.connected && retryCount < 5) {
      const timeout = Math.min(2000 * Math.pow(2, retryCount), 30000); // Max 30s
      const timer = setTimeout(() => {
        checkConnection(true);
      }, timeout);
      
      return () => clearTimeout(timer);
    }
  }, [status.connected, retryCount]);

  // Check connection on component mount and every 30 seconds
  useEffect(() => {
    // Short delay to let Next.js initialize
    const timer = setTimeout(() => {
      checkConnection();
    }, 1000);
    
    const interval = setInterval(() => {
      checkConnection();
    }, 30000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Display API URL in development mode for debugging
  const apiInfo = process.env.NODE_ENV === 'development' 
    ? `API: ${window.location.origin}`
    : '';

  // Get detailed status message
  const getStatusDetails = () => {
    if (status.connected) {
      return status.message;
    }
    
    const baseMsg = status.message || 'Connection failed';
    
    if (retryCount > 0) {
      return `${baseMsg} (Retry ${retryCount}/5)`;
    }
    
    return baseMsg;
  };

  return (
    <div className={`inline-flex items-center gap-2 text-sm ${className}`}>
      {status.connected ? (
        <CheckCircleIcon className="h-5 w-5 text-green-500" />
      ) : (
        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
      )}
      
      <span className={status.connected ? 'text-green-700' : 'text-red-700'}>
        {getStatusDetails()}
        {apiInfo && <span className="text-gray-500 ml-2 text-xs">{apiInfo}</span>}
      </span>
      
      <button 
        onClick={() => checkConnection()}
        disabled={checking}
        title="Check connection"
        className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <ArrowPathIcon className={`h-4 w-4 text-gray-500 ${checking ? 'animate-spin' : ''}`} />
        <span className="sr-only">Check connection</span>
      </button>
      
      {errorDetails && process.env.NODE_ENV === 'development' && (
        <div className="mt-1 text-xs text-red-500">Error: {errorDetails}</div>
      )}
    </div>
  );
};

export default ConnectionStatusIndicator;