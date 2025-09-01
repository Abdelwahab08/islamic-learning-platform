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
}

module.exports = nextConfig
