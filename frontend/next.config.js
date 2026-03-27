/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // Removed for Vercel compatibility
  async rewrites() {
    // Determine the API URL from environment or default to localhost for local dev
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: '/docs',
        destination: `${apiUrl}/docs`,
      },
      {
        source: '/openapi.json',
        destination: `${apiUrl}/openapi.json`,
      }
    ]
  },
}

module.exports = nextConfig
