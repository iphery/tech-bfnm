/*
const nextConfig = {};
export default nextConfig;
*/

/*
// @type {import('next').NextConfig} 
const nextConfig = {};
module.exports = nextConfig;
*/

const withPWA = require("next-pwa")({
  cacheOnFrontEndNav: true,
  dest: "public",
  register: true,
  skipWaiting: true,
  // disable: process.env.NODE_ENV === "development",
});

/**  @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: { domains: ["mita.balifoam.com"] },
};

module.exports = withPWA(nextConfig);
//module.exports = nextConfig;
