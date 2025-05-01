import './globals.css'
import { ThemeProvider } from 'next-themes'
import { Geist } from 'next/font/google'
import type { Metadata, Viewport } from 'next'

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
        className={`${geist.className} scroll-smooth bg-white tracking-tight antialiased transition-all duration-500 ease-out dark:bg-zinc-950`}
      >
        <ThemeProvider
          enableSystem={true}
          attribute="class"
          storageKey="theme"
          defaultTheme="system"
        >
          <div className="grid-background flex min-h-screen w-full flex-col font-[family-name:var(--font-inter-tight)]">
            <div className="relative mx-auto w-full max-w-screen-md flex-1 pt-8">
              <div className="absolute inset-y-0 left-0 w-px bg-zinc-200 transition-all duration-500 ease-out dark:bg-zinc-800"></div>
              <div className="absolute inset-y-0 right-0 w-px bg-zinc-200 transition-all duration-500 ease-out dark:bg-zinc-800"></div>
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
