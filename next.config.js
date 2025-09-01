/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverComponentsExternalPackages: ['mysql2'],
  },
  // Force cache invalidation
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  // Add rewrite rule to redirect /materials to /api/materials
  async rewrites() {
    return [
      {
        source: '/materials',
        destination: '/api/materials',
      },
    ]
  },
}

module.exports = nextConfig
