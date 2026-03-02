import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase the body size limit for large PDF uploads
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  allowedDevOrigins: ["10.2.0.2", "localhost:3000"],
};

export default nextConfig;
