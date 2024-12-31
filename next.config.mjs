import createMDX from "@next/mdx";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["mdx", "ts", "tsx"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [remarkParse, remarkGfm, remarkMath, remarkRehype],
    rehypePlugins: [rehypeStringify],
  },
});

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
