import React from 'react';

interface MapViewerProps {
  center: { lat: number; lng: number };
  zoom: number;
}

const MapViewer: React.FC<MapViewerProps> = ({ center, zoom }) => {
  // This component will integrate with Google Maps
  return (
    <div className="map-container">
      <div className="map-placeholder">
        Map will be displayed here
      </div>
    </div>
  );
};

export default MapViewer;