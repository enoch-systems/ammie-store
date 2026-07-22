/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Increase body size limit for video uploads to the API route
  experimental: {
    serverActions: {
      bodySizeLimit: "120mb",
    },
  },
}

export default nextConfig