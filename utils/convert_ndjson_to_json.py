#!/usr/bin/env python3
import json
import os

def convert_ndjson_to_json(input_file, output_file):
    """Convert NDJSON file to standard JSON array format."""
    print(f"Converting {input_file} to {output_file}...")
    
    # Read NDJSON file line by line and parse each line as JSON
    records = []
    with open(input_file, 'r') as f:
        for line in f:
            if line.strip():  # Skip empty lines
                try:
                    record = json.loads(line)
                    records.append(record)
                except json.JSONDecodeError as e:
                    print(f"Error parsing line: {e}")
                    continue
    
    # Write records as JSON array to output file
    with open(output_file, 'w') as f:
        json.dump(records, f, indent=2)
    
    print(f"Converted {len(records)} records to {output_file}")

if __name__ == '__main__':
    # Path to sample FHIR dataset
    sample_dir = os.path.join(os.getcwd(), 'sample-bulk-fhir-datasets-100-patients')
    
    # Convert Patient NDJSON to JSON
    patient_ndjson = os.path.join(sample_dir, 'Patient.000.ndjson')
    patient_json = os.path.join(os.getcwd(), 'sample_patients.json')
    
    convert_ndjson_to_json(patient_ndjson, patient_json)
    
    print("Conversion complete!")