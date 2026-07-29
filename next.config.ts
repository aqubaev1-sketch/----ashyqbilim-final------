import type { NextConfig } from 'next';
const withPWA = require('next-pwa');
const defaultRuntimeCaching = require('next-pwa/cache');

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
    ],
  },
  transpilePackages: ['motion'],
  webpack: (config, { dev }) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

// PWA функциясын конфигурацияға біріктіреміз
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',

  buildExcludes: [
    /app-build-manifest\.json$/,
  ],

  // IMPORTANT: Supabase (and any other API) requests must bypass the service
  // worker entirely — they're dynamic, per-user/per-course data, not static
  // assets. Without this, the default next-pwa "cross-origin" rule wraps
  // every Supabase call in a NetworkFirst strategy, which both duplicates
  // the network request (page fetch + workbox's own fetch) and caches large
  // API responses in Cache Storage for no benefit. This rule is matched
  // first, so it takes priority over the generic cross-origin default below.
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/[^/]+\.supabase\.co\/.*/i,
      handler: 'NetworkOnly',
    },
    ...defaultRuntimeCaching,
  ],
})(nextConfig);

export default pwaConfig;