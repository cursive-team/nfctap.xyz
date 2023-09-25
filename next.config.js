/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  swcMinify: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig;
