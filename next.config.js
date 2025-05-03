/** @type {import('next').NextConfig} */
const nextConfig = {
  output:"export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['http://localhost:3001'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/media/**',
      },
    ],
  },
  sassOptions: {
    includePaths: ['./app'],
    prependData: `@import "@/app/styles/variables.scss";`,
  },
  trailingSlash: true,
  // Performance optimizations
  swcMinify: true,
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
    scrollRestoration: true,
  },
  // Cache optimization
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;