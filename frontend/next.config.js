/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure the correct directory structure
  pageExtensions: ['jsx', 'js', 'tsx', 'ts'],
}

module.exports = nextConfig