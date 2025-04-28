import React, { useEffect, useRef, useState } from 'react';

interface MapViewerProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
  }>;
}

const KANSAS_CENTER = { lat: 38.5266, lng: -96.7265 };
const DEFAULT_ZOOM = 7;

// For Static Map URL parameters
const createStaticMapUrl = (apiKey: string, center: { lat: number; lng: number }, zoom: number, markers: any[]) => {
  // Base URL
  let url = `https://maps.googleapis.com/maps/api/staticmap?`;
  
  // Add center and zoom
  url += `center=${center.lat},${center.lng}&zoom=${zoom}`;
  
  // Add size (must be within limits, 640x640 max for free tier)
  url += `&size=640x500`;
  
  // Add scale for higher resolution on retina displays
  url += `&scale=2`;
  
  // Add map type
  url += `&maptype=roadmap`;
  
  // Add markers with bright red color
  if (markers && markers.length > 0) {
    // Group all markers under one style for efficiency
    url += `&markers=color:red|size:mid`;
    
    markers.forEach(marker => {
      url += `|${marker.position.lat},${marker.position.lng}`;
    });
  }
  
  // Add API key
  url += `&key=${apiKey}`;
  
  console.log("Generated map URL:", url);
  return url;
};

const MapViewer: React.FC<MapViewerProps> = ({ 
  center = KANSAS_CENTER, 
  zoom = DEFAULT_ZOOM,
  markers = []
}) => {
  // Access environment variable
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // If we've been loading for more than 5 seconds, show a fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("Loading timeout - showing fallback");
        setIsLoading(false);
        setError("Map is taking too long to load. Using fallback Embed API instead.");
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Handle image loading states
  const handleImageLoad = () => {
    console.log("Image loaded successfully");
    setIsLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("Image failed to load:", e);
    setIsLoading(false);
    setError("Failed to load map. Please ensure the Google Static Maps API is enabled for your API key.");
  };
  
  // If API key is missing, show a helpful error message
  if (!apiKey) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 h-[500px] flex items-center justify-center text-center">
        <div>
          <h3 className="text-lg font-semibold text-red-800">Google Maps API Key Missing</h3>
          <p className="text-red-600">Please add your Google Maps API key to the .env file.</p>
        </div>
      </div>
    );
  }

  // Fallback to Embed API if Static Map API fails
  if (error) {
    return (
      <div className="h-[500px] w-full rounded-lg overflow-hidden relative">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          src={`https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${center.lat},${center.lng}&zoom=${zoom}`}
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  // Generate a static map URL with red markers
  const staticMapUrl = createStaticMapUrl(apiKey, center, zoom, markers);

  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden relative shadow-md">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 gap-4 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      )}
      
      <img 
        src={staticMapUrl} 
        alt="Map of Kansas with patient locations"
        className={`w-full h-full object-cover ${isLoading ? 'hidden' : 'block'}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default MapViewer;