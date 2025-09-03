/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable proper error checking in production
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Enable image optimization for better performance
  images: {
    unoptimized: false,
    domains: ['cdn.grofast.com', 'staging-cdn.grofast.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // Enable compression
  compress: true,
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
