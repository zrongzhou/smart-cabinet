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

  // Image optimization — selective optimization for local images only
  // COS images (external) are unoptimized to avoid remotePatterns issues
  images: {
    unoptimized: true, // Keep true for COS compatibility
    // Re-enable formats for local images (when unoptimized is false in future)
    // formats: ['image/webp', 'image/avif'],
    // deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days cache for local images
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
    // Use SWC for minification (faster than Terser)
    swcMinify: true,
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
