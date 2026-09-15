import type { NextConfig } from "next";

const mediaBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const mediaUrl = new URL(mediaBaseUrl);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: mediaUrl.protocol.replace(":", "") as "http" | "https",
        hostname: mediaUrl.hostname,
        port: mediaUrl.port || undefined,
      },
    ],
  },
};

export default nextConfig;
