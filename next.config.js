/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temel yapılandırma
  reactStrictMode: true,
  
  // Görüntü alan adlarına izin verme
  images: {
    domains: [
      'translateth.dev', 
      'vercel.app', 
      'localhost',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com', 
      'i.pravatar.cc'
    ],
  },
  
  // Webpack alias yapılandırması - daha güvenli
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': require('path').resolve(__dirname, 'src')
    };
    return config;
  },
  
  // Performans iyileştirmeleri
  swcMinify: true,
  
  // Güvenlik iyileştirmeleri
  poweredByHeader: false,
  
  // useLayoutEffect SSR uyarılarını bastır
  compiler: {
    styledComponents: true,
    // React hatalarını azaltmak için
    emotion: true,
  }
};

module.exports = nextConfig; 