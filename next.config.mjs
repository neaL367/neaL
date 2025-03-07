import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypePrettyCode from "rehype-pretty-code";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "scontent.cdninstagram.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
};

/** @type {import('rehype-pretty-code').Options} */
const options = {
  keepBackground: false,
  theme: "github-light",
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkParse, remarkGfm, remarkMath, remarkRehype],
    rehypePlugins: [rehypeStringify, [rehypePrettyCode, options]],
  },
  experimental: {
    mdxRs: true,
  },
});

export default withMDX(nextConfig);
