/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure the correct directory structure
  pageExtensions: ['jsx', 'js', 'tsx', 'ts'],
  
  // Setup API proxy for client-side requests
  async rewrites() {
    // Hardcode to localhost:8000 for local development
    // This assumes the backend is running locally on port 8000
    const apiUrl = 'http://localhost:8000';
      
    console.log('Next.js rewrites using API URL:', apiUrl);
    
    return [
      // API health check
      {
        source: '/health',
        destination: `${apiUrl}/health`,
      },
      // Debug endpoint for troubleshooting
      {
        source: '/debug',
        destination: `${apiUrl}/debug`,
      },
      // API status endpoint
      {
        source: '/api/v1/status',
        destination: `${apiUrl}/api/v1/status`,
      },
      // Other API v1 endpoints
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
      // FHIR endpoints
      {
        source: '/fhir/:path*',
        destination: `${apiUrl}/api/v1/fhir/:path*`,
      },
    ];
  },
}

module.exports = nextConfig