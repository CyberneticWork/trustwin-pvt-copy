/** @type {import('next').NextConfig} */
import withPWA from "next-pwa";

const nextConfig = {
  reactStrictMode: true,
};

const pwaConfig = withPWA({
  dest: "public", // Directory where PWA files will be generated
  sw: "/sw.js",   // Path to your custom service worker (optional)
});

// Export the combined configuration
export default pwaConfig(nextConfig);