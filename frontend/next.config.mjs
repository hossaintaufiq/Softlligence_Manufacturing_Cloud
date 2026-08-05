/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const api = process.env.API_URL || 'http://localhost:5001';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${api}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
