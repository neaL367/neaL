import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  reactStrictMode: true,
  cacheComponents: true,
  typedRoutes: true,
  experimental: {
    mdxRs: true,
  },
} satisfies NextConfig;

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);