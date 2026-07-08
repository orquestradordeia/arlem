import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF first, fall back to WebP — major size reduction vs PNG/JPEG
    formats: ['image/avif', 'image/webp'],
    // Mobile-first breakpoints
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Allow next/image to optimize images from Supabase Storage
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cjxmynoimzpomynhyiwq.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Serve cached optimized images for 24 hours (reduces re-optimization CPU)
    minimumCacheTTL: 86400,
  },
  // Compress all responses with gzip/br
  compress: true,
  // Remove powered-by header
  poweredByHeader: false,
};

export default nextConfig;
