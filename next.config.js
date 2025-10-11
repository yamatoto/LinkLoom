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
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google avatars
      },
    ],
  },

  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', 'dayjs'],
  },

  webpack: (config, { isServer, dev }) => {
    // 本番ビルド時にDEV_AUTH_BYPASSが有効になっていないかチェック
    if (!dev && !isServer) {
      if (process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true') {
        throw new Error(
          '🚨 SECURITY: NEXT_PUBLIC_DEV_AUTH_BYPASS is enabled in production build! ' +
            'Please set NEXT_PUBLIC_DEV_AUTH_BYPASS to false or remove it from environment variables.'
        )
      }
    }
    return config
  },
}

module.exports = nextConfig
