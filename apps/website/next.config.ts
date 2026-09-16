import type { NextConfig } from "next";

if (process.env.NODE_ENV === "production") {
  for (const name of ["API_URL", "NEXT_PUBLIC_API_URL"]) {
    if (!process.env[name]) {
      throw new Error(`${name} must be defined for a production build.`);
    }
  }
}

const mediaBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const mediaUrl = new URL(mediaBaseUrl);

// The API backend commonly runs on localhost/a private IP in dev — without
// dangerouslyAllowLocalIP, Next's SSRF guard blocks every fetch to it (the
// Image Optimizer 400s on every media URL). That's fine to allow by default
// in dev, but must stay opt-in in production. ALLOW_LOCAL_MEDIA_IP lets an
// operator explicitly enable it for a production deployment where the API
// is intentionally reached over a private network; unset, it defaults to
// on outside production and off in production.
const allowLocalMediaIpEnv = process.env.ALLOW_LOCAL_MEDIA_IP;
const allowLocalMediaIp =
  allowLocalMediaIpEnv !== undefined
    ? allowLocalMediaIpEnv === "true"
    : process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: mediaUrl.protocol.replace(":", "") as "http" | "https",
        hostname: mediaUrl.hostname,
        port: mediaUrl.port || undefined,
      },
    ],
    dangerouslyAllowLocalIP: allowLocalMediaIp,
  },
};

export default nextConfig;
