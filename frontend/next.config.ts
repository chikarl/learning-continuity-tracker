import type { NextConfig } from "next";
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig: NextConfig = {
  // Required for the multi-stage Docker build (Cloud Run deployment)
  output: 'standalone',
};

module.exports = withPWA(nextConfig);
