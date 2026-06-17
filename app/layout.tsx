import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { baseUrl } from '@/app/sitemap';
import type { Metadata, Viewport } from 'next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <main className="w-full my-0 md:my-16">{props.children}</main>
      </body>
    </html>
  );
}
