import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  typedRoutes: true,
  experimental: {
    mdxRs: true,
  },
  cacheComponents: true,
} satisfies NextConfig;

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);