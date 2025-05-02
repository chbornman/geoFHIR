import os
import tempfile
import json
import geopandas as gpd
from shapely.geometry import Point, shape
from sqlalchemy.orm import Session
from typing import Dict, List, Optional, Any, Union
from sqlalchemy import text

from app.models.geospatial import GeoFeature, GeoDataset, FeatureDatasetAssociation
from app.core.config import settings

class GeoService:
    def __init__(self):
        # Initialize with empty caches
        self.feature_cache = {}
        self.dataset_cache = {}
    
    def load_geojson_data(self, db: Session, file_content: bytes, filename: str, dataset_name: str, description: Optional[str] = None) -> Dict[str, Any]:
        """
        Load GeoJSON data into PostGIS database
        
        Args:
            db: Database session
            file_content: GeoJSON file content as bytes
            filename: Original filename
            dataset_name: Name for the dataset
            description: Optional description
            
        Returns:
            Dict with import results
        """
        # Create temporary file to work with GeoPandas
        with tempfile.NamedTemporaryFile(suffix='.geojson', delete=False) as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name
        
        try:
            # Parse GeoJSON with GeoPandas
            gdf = gpd.read_file(temp_file_path)
            
            # Parse raw JSON for metadata
            geojson_data = json.loads(file_content)
            
            # Create new dataset record
            dataset = GeoDataset(
                name=dataset_name,
                description=description,
                original_filename=filename,
                metadata=geojson_data.get("properties", {})
            )
            db.add(dataset)
            db.flush()  # Get the dataset ID
            
            # Import features
            feature_count = 0
            for _, row in gdf.iterrows():
                properties = row.get('properties', {})
                if isinstance(properties, dict):
                    name = properties.get('name', f"Feature {feature_count}")
                else:
                    name = f"Feature {feature_count}"
                    properties = {}
                
                # Get the feature type from properties or default to 'unknown'
                feature_type = properties.get('type', 'unknown')
                
                # Create GeoFeature record
                geo_feature = GeoFeature(
                    name=name,
                    feature_type=feature_type,
                    description=properties.get('description'),
                    properties=properties,
                    geometry=row.geometry
                )
                db.add(geo_feature)
                db.flush()  # Get the feature ID
                
                # Create association between feature and dataset
                association = FeatureDatasetAssociation(
                    feature_id=geo_feature.id,
                    dataset_id=dataset.id
                )
                db.add(association)
                
                feature_count += 1
            
            # Commit all changes
            db.commit()
            
            return {
                "status": "success",
                "message": f"Imported {feature_count} features from GeoJSON",
                "dataset_id": dataset.id,
                "feature_count": feature_count
            }
        
        except Exception as e:
            db.rollback()
            return {
                "status": "error",
                "message": f"Failed to import GeoJSON: {str(e)}"
            }
        finally:
            # Clean up temp file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
    
    def get_datasets(self, db: Session, skip: int = 0, limit: int = 100) -> List[GeoDataset]:
        """Get all available GeoJSON datasets"""
        return db.query(GeoDataset).offset(skip).limit(limit).all()
    
    def get_dataset(self, db: Session, dataset_id: int) -> Optional[GeoDataset]:
        """Get a specific dataset by ID"""
        return db.query(GeoDataset).filter(GeoDataset.id == dataset_id).first()
    
    def get_dataset_features(self, db: Session, dataset_id: int) -> Dict[str, Any]:
        """Get all features for a dataset as GeoJSON"""
        # First, check if dataset exists
        dataset = self.get_dataset(db, dataset_id)
        if not dataset:
            return {"status": "error", "message": "Dataset not found"}
        
        # Get all features associated with this dataset
        query = text("""
            SELECT 
                gf.id, 
                gf.name, 
                gf.feature_type, 
                gf.description, 
                gf.properties,
                ST_AsGeoJSON(gf.geometry) as geometry
            FROM geo_features gf
            JOIN feature_dataset_association fda ON gf.id = fda.feature_id
            WHERE fda.dataset_id = :dataset_id
        """)
        
        result = db.execute(query, {"dataset_id": dataset_id})
        
        # Construct GeoJSON
        features = []
        for row in result:
            feature = {
                "type": "Feature",
                "id": row.id,
                "properties": {
                    "name": row.name,
                    "feature_type": row.feature_type,
                    "description": row.description,
                    **row.properties if row.properties else {}
                },
                "geometry": json.loads(row.geometry)
            }
            features.append(feature)
        
        geojson = {
            "type": "FeatureCollection",
            "name": dataset.name,
            "features": features
        }
        
        return {
            "status": "success",
            "geojson": geojson,
            "feature_count": len(features)
        }
    
    def patient_locations_to_geodataframe(self, patients):
        """Convert patient location data to GeoDataFrame"""
        points = []
        attributes = []
        
        for patient in patients:
            # Extract lat/long from FHIR patient data structure
            address = patient.get('address', [{}])[0] if patient.get('address') else {}
            
            # Look for geolocation extension
            if address and address.get('extension'):
                geo_extension = next(
                    (ext for ext in address.get('extension', []) 
                     if ext.get('url') == 'http://hl7.org/fhir/StructureDefinition/geolocation'),
                    None
                )
                
                if geo_extension and geo_extension.get('extension'):
                    lat_ext = next(
                        (ext for ext in geo_extension.get('extension', []) 
                         if ext.get('url') == 'latitude'),
                        None
                    )
                    
                    lon_ext = next(
                        (ext for ext in geo_extension.get('extension', []) 
                         if ext.get('url') == 'longitude'),
                        None
                    )
                    
                    lat = lat_ext.get('valueDecimal') if lat_ext else None
                    lon = lon_ext.get('valueDecimal') if lon_ext else None
                    
                    if lat is not None and lon is not None:
                        points.append(Point(float(lon), float(lat)))
                        
                        # Format patient name
                        name = ""
                        if patient.get('name'):
                            name_obj = patient['name'][0]
                            given = " ".join(name_obj.get('given', []))
                            family = name_obj.get('family', '')
                            name = f"{given} {family}".strip()
                        
                        attributes.append({
                            'id': patient.get('id'),
                            'name': name,
                            'gender': patient.get('gender'),
                            'birthDate': patient.get('birthDate'),
                            'city': address.get('city'),
                            'state': address.get('state'),
                            'postalCode': address.get('postalCode')
                        })
        
        return gpd.GeoDataFrame(attributes, geometry=points, crs="EPSG:4326")
    
    def analyze_spatial_correlation(self, db: Session, patient_data, dataset_id: int, buffer_distance: float = 1000):
        """
        Analyze spatial correlation between patients and geographic features
        
        Args:
            db: Database session
            patient_data: List of patient data in FHIR format
            dataset_id: ID of the dataset to analyze against
            buffer_distance: Buffer distance in meters
            
        Returns:
            Dict with analysis results
        """
        try:
            # Convert patients to geodataframe
            patient_gdf = self.patient_locations_to_geodataframe(patient_data)
            
            if patient_gdf.empty:
                return {
                    "status": "error",
                    "message": "No patient locations available for analysis"
                }
            
            # Get dataset features
            dataset_result = self.get_dataset_features(db, dataset_id)
            if dataset_result["status"] != "success":
                return dataset_result
            
            # Convert GeoJSON to GeoDataFrame
            geojson_data = dataset_result["geojson"]
            infrastructure_gdf = gpd.GeoDataFrame.from_features(geojson_data["features"], crs="EPSG:4326")
            
            # Create buffers around infrastructure features
            infrastructure_buffered = infrastructure_gdf.copy()
            infrastructure_buffered['geometry'] = infrastructure_gdf.geometry.buffer(buffer_distance / 111000)  # Roughly convert meters to degrees
            
            # Perform spatial join to find patients within the buffer
            joined = gpd.sjoin(patient_gdf, infrastructure_buffered, how="inner", predicate="within")
            
            # Format results
            analysis_result = {
                "total_patients": len(patient_gdf),
                "matched_patients": len(joined),
                "percentage": round(len(joined) / len(patient_gdf) * 100, 2) if len(patient_gdf) > 0 else 0,
                "features": {}
            }
            
            # Group by features
            for feature_id, group in joined.groupby('index_right'):
                feature = infrastructure_gdf.iloc[feature_id]
                feature_name = feature.get('properties', {}).get('name', f"Feature {feature_id}")
                
                analysis_result["features"][feature_name] = {
                    "patient_count": len(group),
                    "percentage": round(len(group) / len(patient_gdf) * 100, 2) if len(patient_gdf) > 0 else 0,
                    "patients": group.to_dict('records')
                }
            
            return {
                "status": "success",
                "result": analysis_result
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Error in spatial analysis: {str(e)}"
            }