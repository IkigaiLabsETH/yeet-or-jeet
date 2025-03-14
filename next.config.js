/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.geckoterminal.com',
      },
    ],
  },
};

module.exports = nextConfig; 