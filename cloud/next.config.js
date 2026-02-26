/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  // Optimize for production
  experimental: {
    optimizePackageImports: ['@heroicons/react', '@headlessui/react'],
  },
  // Ensure proper handling of API routes
  async rewrites() {
    return []
  },
}

module.exports = nextConfig