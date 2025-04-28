# Project Notes for Claude

## Environment Variables
All API keys and environment variables should be stored in the top-level `.env` file. This is the single source of truth for configuration. Any subsections (frontend, backend, etc.) that need environment variables should reference the values from this file rather than having their own separate environment files.

For Docker Compose, use the format `${VARIABLE_NAME}` to reference variables from the top-level `.env` file.

For Next.js frontend, ensure client-side environment variables are prefixed with `NEXT_PUBLIC_`.

## Sample Data
Sample FHIR data is located in `/sample_data`