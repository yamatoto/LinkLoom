/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Next.js Dev Toolsを完全に無効化（画面左下のNボタン）
  devIndicators: false,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },

  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', 'dayjs'],
  },
}

module.exports = nextConfig
