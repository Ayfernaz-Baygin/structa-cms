import type { NextConfig } from "next";

if (process.env.NODE_ENV === "production") {
  for (const name of ["API_URL", "NEXT_PUBLIC_API_URL"]) {
    if (!process.env[name]) {
      throw new Error(`${name} must be defined for a production build.`);
    }
  }
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
