# GeoFHIR

GeoFHIR is a framework for analyzing geographic patterns in healthcare data using FHIR (Fast Healthcare Interoperability Resources) standards. The platform allows healthcare providers to upload FHIR data and map it against geographic infrastructure data to identify potential environmental health risks.

## Problem Statement

Healthcare providers often have valuable data showing patterns of disease but lack the tools to correlate these patterns with environmental factors. GeoFHIR bridges this gap by providing a platform where hospitals can:

- Upload FHIR-formatted patient data
- Map patient locations and diagnoses against geographic data (e.g., water pipelines, industrial facilities)
- Identify potential correlations between health conditions and environmental factors
- Generate visualizations and reports to support public health interventions

## Features

- FHIR data ingestion and processing:
  - Upload FHIR JSON files directly (Patient, Observation, Location resources)
  - Support for single resources, resource arrays, and FHIR Bundles
  - Optional connection to external FHIR servers (disabled by default)
- Geographic data integration (pipelines, infrastructure, etc.)
- Interactive mapping visualization
- Correlation analysis between health data and geographic features
- Reporting and export functionality
- Role-based access controls for sensitive health data

## Project Structure

```
GeoFHIR/
├── backend/                  # Python FastAPI backend
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   │   └── endpoints/
│   │   │       └── fhir.py   # FHIR data endpoints
│   │   ├── core/             # Core application code
│   │   │   └── config.py     # Configuration settings
│   │   ├── db/               # Database models and setup
│   │   │   └── base.py       # SQLAlchemy setup
│   │   ├── fhir/             # FHIR integration
│   │   ├── geo/              # Geospatial capabilities
│   │   ├── models/           # Pydantic models
│   │   ├── services/         # Business logic
│   │   │   ├── fhir_service.py  # FHIR operations
│   │   │   └── geo_service.py   # Geospatial operations
│   │   └── utils/            # Utility functions
│   ├── tests/                # Test suite
│   ├── Dockerfile            # Docker configuration
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # Next.js/React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── common/       # Shared components
│   │   │   ├── fhir/         # FHIR-related components
│   │   │   │   └── PatientList.tsx
│   │   │   └── maps/         # Mapping components
│   │   │       └── MapViewer.tsx
│   │   ├── pages/            # Next.js pages
│   │   │   └── index.tsx     # Homepage
│   │   └── utils/            # Utility functions
│   ├── public/               # Static assets
│   ├── Dockerfile            # Docker configuration
│   └── package.json          # NPM dependencies
│
├── docs/                     # Documentation
├── docker-compose.yml        # Docker Compose config
└── .env.example              # Environment variables template
```

## Tech Stack

- **Backend**: Python with FastAPI
- **Database**: PostgreSQL with PostGIS extension for geospatial capabilities
- **FHIR Integration**: fhirclient Python library
- **Frontend**: React/Next.js
- **Mapping**: Google Maps API integration
- **Geospatial Data**: GeoJSON format support

## Implementation Status

### Backend
- FHIR ingestion & caching: implemented via upload endpoint `/api/v1/fhir/import/file` and in-memory cache.
- API endpoints for:
  - Listing patients (`GET /api/v1/fhir/patients`)
  - Patient observations (`GET /api/v1/fhir/patients/{id}/observations`)
  - Locations (`GET /api/v1/fhir/locations`)
  - Health/status endpoints (`/`, `/health`, `/api/v1/status`, `/api/v1/fhir/health`)
- Persistent database models and migrations: not implemented (uses in-memory or dummy DB).
- External FHIR server support: stubbed (feature-flagged, untested).
- Geospatial analysis endpoints: not yet exposed via API.

### Frontend
- Data ingestion:
  - FileUpload component for JSON/NDJSON uploads: implemented.
  - Sample data loader via `/api/sample-patients`: implemented.
- Data display:
  - PatientList component: implemented, lists patients and badges, with selection.
  - MapViewer component: implemented (Google Static Maps API + fallback Embed API).
- Correlation analysis & reporting UI: stubs present, but no functionality.
- Connection status indicator: implemented.
- Role-based access control, reporting/export features: not implemented.

### Other
- `docs/` directory: empty (no markdown documentation beyond this README).
- Tests: backend `tests/` folder is empty; no test suite.
- `.env.example`: referenced but not included (create a `.env` file with required variables).
- Sample data & utils: sample FHIR NDJSON data under `sample_data`, conversion script in `utils/`.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Setup

#### Using Docker (Recommended)

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your configuration, including your Google Maps API key
3. Run `docker compose up -d` to start all services
   - This will automatically use variables from the top-level `.env` file
4. Access the frontend at http://localhost:3000
5. Access the API at http://localhost:8000

#### Local Development (Backend)

1. Clone the repository
2. Create and activate a Python virtual environment:
   ```bash
   cd geoFHIR
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Start a PostgreSQL database (with PostGIS) using Docker:
   ```bash
   docker compose up db
   ```
   Or configure your `.env` file to point to an existing PostgreSQL instance
5. Run the FastAPI server in development mode:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```
6. Access the API at http://localhost:8000
7. Visit http://localhost:8000/docs for interactive API documentation

**Note:** When the FastAPI server is running with `--reload`, code changes will automatically restart the server.

## Architecture Overview

GeoFHIR uses a layered architecture:

1. **Data Layer**: PostgreSQL database with PostGIS for storing both health records and geographic information
2. **API Layer**: FastAPI endpoints for data ingestion, queries, and analysis
3. **Visualization Layer**: React/Next.js frontend with interactive mapping components
4. **Analytics Layer**: Python-based correlation analysis between health and geographic data

## Contributing

This project is in the early planning stages. Contributions and suggestions are welcome.

## License

*License information pending*