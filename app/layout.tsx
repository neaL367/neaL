import './globals.css';
import { GeistMono } from 'geist/font/mono';
import { GeistPixelSquare } from 'geist/font/pixel';
import { baseUrl } from '@/app/sitemap';
import type { Metadata, Viewport } from 'next';
import LenisProvider from '@/components/lenis-provider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { default: 'Neal367', template: '%s | Neal367' },
  description: 'Lazy coding | Gamer | PixelArt | Rockstar Games fan',
  icons: {
    icon: '/avatar.png',
    apple: [{ url: '/avatar.png', sizes: '120x120' }, { url: '/avatar.png' }],
  },
  openGraph: {
    title: 'Neal367',
    description: 'Lazy coding | Gamer | PixelArt | Rockstar Games fan',
    url: baseUrl,
    siteName: 'Neal367',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/opengraph-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'neaL367 - Personal website',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeaL367',
    description: 'Lazy coding | Gamer | PixelArt | Rockstar Games fan',
    creator: '@NL367',
    images: `${baseUrl}/opengraph-image.jpg`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout(props: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${GeistMono.variable} ${GeistPixelSquare.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <LenisProvider>
          <main className="w-full my-0 md:my-16">{props.children}</main>
        </LenisProvider>
      </body>
    </html>
  );
}
