import geopandas as gpd
from shapely.geometry import Point

class GeoService:
    def __init__(self):
        # This would be initialized with geographic data sources
        pass
    
    def load_infrastructure_data(self, file_path, layer=None):
        """Load infrastructure data from shapefile or GeoJSON"""
        if file_path.endswith('.shp'):
            return gpd.read_file(file_path, layer=layer)
        elif file_path.endswith('.geojson'):
            return gpd.read_file(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_path}")
    
    def patient_locations_to_geodataframe(self, patients):
        """Convert patient location data to GeoDataFrame"""
        points = []
        attributes = []
        
        for patient in patients:
            # Extract lat/long from patient data
            # This is simplified and would need to be adapted to actual FHIR data structure
            lat = patient.get('latitude')
            lon = patient.get('longitude')
            
            if lat and lon:
                points.append(Point(float(lon), float(lat)))
                attributes.append({
                    'id': patient.get('id'),
                    'name': patient.get('name'),
                    # Add other relevant patient attributes
                })
        
        return gpd.GeoDataFrame(attributes, geometry=points, crs="EPSG:4326")
    
    def analyze_spatial_correlation(self, patient_gdf, infrastructure_gdf, buffer_distance=1000):
        """Analyze spatial correlation between patients and infrastructure"""
        # Create buffers around infrastructure features
        infrastructure_buffered = infrastructure_gdf.copy()
        infrastructure_buffered['geometry'] = infrastructure_gdf.geometry.buffer(buffer_distance)
        
        # Perform spatial join to find patients within the buffer
        joined = gpd.sjoin(patient_gdf, infrastructure_buffered, how="inner", predicate="within")
        
        return joined