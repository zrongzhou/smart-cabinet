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
    // 301 重定向：旧产品 URL -> 新 URL（来源：Excel「产品标题+URL.xlsx」中 URL 变化的产品）
    // 由 scripts/import-product-updates.* 配套的 scripts/redirects.json 生成。
    // slug 已按 src/lib/slug.ts 的 normalizeSlug 规范化，与 getProductHref 生成的链接一致。
    // 旧站 URL 均带 .html，故新 URL 和 destination 也带 .html；同时提供无后缀 source 兜底。
    const productUrlRedirects = [
      { source: '/en/automated-storage-cabinet', destination: '/en/products/automated-tool-storage-system.html', permanent: true },
      { source: '/en/automated-storage-cabinet.html', destination: '/en/products/automated-tool-storage-system.html', permanent: true },
      { source: '/en/solutions/medical-device-manufacturing-supplies', destination: '/en/solutions/medical-device-inventory-management.html', permanent: true },
      { source: '/en/solutions/medical-device-manufacturing-supplies.html', destination: '/en/solutions/medical-device-inventory-management.html', permanent: true },
      { source: '/en/applications/smart-file-cabinet', destination: '/en/applications/secure-document-storage-cabinet.html', permanent: true },
      { source: '/en/applications/smart-file-cabinet.html', destination: '/en/applications/secure-document-storage-cabinet.html', permanent: true },
      { source: '/en/applications/cnc-tool-vending-machine', destination: '/en/applications/tool-vending-machine-cnc-tools.html', permanent: true },
      { source: '/en/applications/cnc-tool-vending-machine.html', destination: '/en/applications/tool-vending-machine-cnc-tools.html', permanent: true },
      { source: '/en/applications/tool-tracking-system', destination: '/en/applications/rfid-tool-tracking-cabinet.html', permanent: true },
      { source: '/en/applications/tool-tracking-system.html', destination: '/en/applications/rfid-tool-tracking-cabinet.html', permanent: true },
      { source: '/en/applications/chemical-storage-cabinet', destination: '/en/applications/refrigerated-chemical-storage-cabinet.html', permanent: true },
      { source: '/en/applications/chemical-storage-cabinet.html', destination: '/en/applications/refrigerated-chemical-storage-cabinet.html', permanent: true },
      { source: '/en/solutions/electronics-manufacturing-inventory', destination: '/en/solutions/electronics-esd-supplies-inventory.html', permanent: true },
      { source: '/en/solutions/electronics-manufacturing-inventory.html', destination: '/en/solutions/electronics-esd-supplies-inventory.html', permanent: true },
      { source: '/en/cnc-tool-vending-machines', destination: '/en/products/tool-vending-machine-cnc-tools.html', permanent: true },
      { source: '/en/cnc-tool-vending-machines.html', destination: '/en/products/tool-vending-machine-cnc-tools.html', permanent: true },
      { source: '/en/solutions/automotive-manufacturing-inventory', destination: '/en/solutions/automotive-ev-parts-inventory.html', permanent: true },
      { source: '/en/solutions/automotive-manufacturing-inventory.html', destination: '/en/solutions/automotive-ev-parts-inventory.html', permanent: true },
    ];
    return [
      ...productUrlRedirects,
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
