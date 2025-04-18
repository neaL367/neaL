import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Header } from './header'
import { Footer } from './footer'
import { ThemeProvider } from 'next-themes'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://neal367.vercel.app'),
  title: 'neaL367 - Personal website',
  description: 'Gamer and Lazy Front-end developer.',
  openGraph: {
    title: 'neaL367 - Personal website',
    description: 'Gamer and Lazy Front-end developer.',
    type: 'website',
    siteName: 'neaL367',
    images: [
      {
        url: './opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'neaL367 - Personal website',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'neaL367 - Personal website',
    description: 'Gamer and Lazy Front-end developer.',
    creator: '@NL367',
    images: './opengraph-image.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const geist = Geist({
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.className} scroll-smooth bg-white tracking-tight antialiased dark:bg-zinc-950`}
      >
        <ThemeProvider
          enableSystem={true}
          attribute="class"
          storageKey="theme"
          defaultTheme="system"
        >
          <div className="flex min-h-screen w-full flex-col font-[family-name:var(--font-inter-tight)]">
            <div className="relative mx-auto w-full max-w-screen-sm flex-1 px-4 pt-20">
              <Header />
              {children}
              <Footer />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
