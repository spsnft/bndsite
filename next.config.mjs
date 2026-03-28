/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Оптимизация CSS (убирает блокирующие ресурсы)
  experimental: {
    optimizeCss: true, 
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Добавь это, раз мы используем Cloudinary для лого
      },
    ],
  },
};

export default nextConfig;
