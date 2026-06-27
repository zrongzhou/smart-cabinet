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
    // Enable optimized package imports for faster builds
    optimizePackageImports: ['lucide-react', '@tiptap/react'],
  },
  
  // Image optimization for external images
  // NOTE: Set unoptimized: true to bypass Next.js image optimization
  // This fixes the issue where ** wildcard in remotePatterns is invalid
  // and external images from Tencent Cloud COS fail to load
  images: {
    // Disable optimization to allow all external images
    // This is the most reliable fix for COS image loading issues
    unoptimized: true,
    
    // Keep formats and sizes config for reference (not used when unoptimized: true)
    // formats: ['image/webp', 'image/avif'],
    // deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // minimumCacheTTL: 60 * 60 * 24 * 7,
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
    ];
  },
  
  // Compiler optimizations
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Enable compression
  compress: true,
  
  // Powered by header
  poweredByHeader: false,
};

export default withBundleAnalyzer(nextConfig);
