/* eslint-disable @typescript-eslint/no-explicit-any */
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config: any) => {
    // Ensure .mjs files are resolved correctly
    if (!config.resolve.extensionAlias) {
      config.resolve.extensionAlias = {};
    }
    config.resolve.extensionAlias['.js'] = ['.js', '.mjs'];
    return config;
  },
};

export default nextConfig;
