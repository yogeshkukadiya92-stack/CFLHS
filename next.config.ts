import type {NextConfig} from 'next';

const isMobileBuild = process.env.MOBILE_BUILD === '1';

const nextConfig: NextConfig = {
  output: isMobileBuild ? 'export' : 'standalone',
  trailingSlash: isMobileBuild,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: isMobileBuild,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
   webpack: (config, { isServer }) => {
    if (isServer) {
        config.externals.push({
            'handlebars': 'commonjs handlebars'
        });
    }
    return config;
  },
};

export default nextConfig;
