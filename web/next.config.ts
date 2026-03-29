import type { NextConfig } from "next";

function parseAllowedImageHosts(value: string | undefined) {
  return value
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean) ?? [];
}

const allowedImageHosts = parseAllowedImageHosts(
  process.env.ALLOWED_IMAGE_HOSTS,
);

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  images: {
    remotePatterns: allowedImageHosts.flatMap((hostname) => [
      {
        protocol: "https" as const,
        hostname,
      },
      {
        protocol: "http" as const,
        hostname,
      },
    ]),
  },
};

export default nextConfig;
