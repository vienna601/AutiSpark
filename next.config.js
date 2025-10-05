/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  outputFileTracingRoot: __dirname,
  experimental: {
    // Remove deprecated appDir option
  }
}

module.exports = nextConfig
