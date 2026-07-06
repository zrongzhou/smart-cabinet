/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,

  // Allow large file uploads (50MB)
  async rewrites() {
    return [];
  },

  // Redirect old admin URLs to 404 (new admin lives at /xiaozhouBackend)
  async redirects() {
    return [
      { source: '/admin/:path*', destination: '/404', permanent: false },
      { source: '/admin', destination: '/404', permanent: false },
    ];
  },

  // Increase body size limit for file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
    // Optimize package imports — tree-shake lucide-react + tiptap
    optimizePackageImports: [
      'lucide-react',
      '@tiptap/react',
      '@tiptap/pm',
      'framer-motion',
      'recharts',
    ],
  },

  // Image optimization — ENABLED (v241 performance fix)
  images: {
    unoptimized: false, // ENABLED! (was true - disabled optimization)
    formats: ['image/webp', 'image/avif'], // Prefer WebP
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days cache
    // Allow COS CDN and external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.myqcloud.com', // Tencent COS CDN
      },
      {
        protocol: 'https',
        hostname: 'test.wstoolcabinet.com', // Production domain
      },
    ],
  },

  // Suppress Google Translate
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'google',
            value: 'notranslate',
          },
        ],
      },
      // Cache static assets (images, fonts, CSS, JS)
      {
        source: '/:all*(svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, immutable',
          },
        ],
      },
      {
        source: '/:all*(css|js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Compiler optimizations
  compiler: {
    // Remove console.logs in production (keep errors/warnings)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    // SWC minification is always enabled in Next.js 14+ (no config needed)
    // swcMinify: true,  // REMOVED: deprecated in Next.js 14
  },

  // Enable compression (Next.js built-in gzip)
  compress: true,

  // Disable powered by header
  poweredByHeader: false,

  // Webpack optimization for smaller chunks
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Production client bundle optimizations
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Framer Motion — separate chunk (loaded only on pages that need it)
          framer: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            priority: 20,
            reuseExistingChunk: true,
          },
          // Lucide React icons
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide-react',
            priority: 10,
            reuseExistingChunk: true,
          },
          // UI libraries (MUI, Radix, etc.)
          ui: {
            test: /[\\/]node_modules[\\/](@mui|@radix-ui|class-variance-authority)[\\/]/,
            name: 'ui-libs',
            priority: 5,
            reuseExistingChunk: true,
          },
          // Common vendor code
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
