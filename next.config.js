/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        undici: false,
      };
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      undici: false,
    };
    return config;
  },
}

module.exports = nextConfig