import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Ảnh bìa lấy từ Google Drive (thumbnail) và ảnh đại diện Google
    remotePatterns: [
      { protocol: "https", hostname: "drive.google.com", pathname: "/thumbnail" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
