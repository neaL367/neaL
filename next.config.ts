import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  reactStrictMode: true,
  cacheComponents: true,
  reactCompiler: true,
  typedRoutes: true,
  experimental: {
    mdxRs: true,
  },
} satisfies NextConfig;

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(withMDX(nextConfig));