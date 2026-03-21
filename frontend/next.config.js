/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./i18n.ts');

const nextConfig = {
  reactStrictMode: true,
  /* output: 'export' for Capacitor */
  output: process.env.NEXT_PUBLIC_IS_CAPACITOR === 'true' ? 'export' : undefined,
  images: {
    unoptimized: process.env.NEXT_PUBLIC_IS_CAPACITOR === 'true',
  }
};

module.exports = withNextIntl(nextConfig);
