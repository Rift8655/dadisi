/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  turbopack: {
    root: path.join(__dirname, '..'),
  }, // Enable Turbopack
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.builder.io',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
