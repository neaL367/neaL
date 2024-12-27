import type { NextConfig } from 'next';
import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig =  {
  pageExtensions: ['mdx', 'ts', 'tsx'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media-rockstargames-com.akamaized.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    mdxRs: true,
  },
}

const withMDX = createMDX({});


export default withMDX(nextConfig)

