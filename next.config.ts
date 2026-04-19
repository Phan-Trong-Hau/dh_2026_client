import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "54.251.154.71",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dh-2026-media.s3.ap-southeast-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
