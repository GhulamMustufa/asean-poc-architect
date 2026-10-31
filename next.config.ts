import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // The dev-only "N" badge sat on top of the mobile tab bar. Errors still show.
  devIndicators: false,
};

export default nextConfig;
