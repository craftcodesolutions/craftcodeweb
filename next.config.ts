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
    
    // Exclude server-side Socket.IO modules from client-side bundle
    if (!config.resolve.fallback) {
      config.resolve.fallback = {};
    }
    
    // Prevent Node.js modules from being bundled on client-side
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };
    
    // Exclude socket.io server from client bundle
    if (config.isServer === false) {
      config.externals = config.externals || [];
      config.externals.push({
        'socket.io': 'socket.io',
        'socket.io-adapter': 'socket.io-adapter',
      });
    }
    
    return config;
  },
};

export default nextConfig;
