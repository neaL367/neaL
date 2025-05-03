export type Certificate = {
  title: string
  issuer: string
  date: string
  link: string
  logo?: string
}

export const CERTIFICATES: Certificate[] = [
  {
    title: "Next.js SEO",
    issuer: "Vercel",
    date: "April 2025",
    link: "https://nextjs.org/learn/certificate?course=seo&user=48535&certId=seo-48535-1746086105290",
    logo: "/certs/vercel-logo.svg"
  },
  {
    title: "Next.js App Router",
    issuer: "Vercel",
    date: "April 2025",
    link: "https://nextjs.org/learn/certificate?course=dashboard-app&user=48535&certId=dashboard-app-48535-1746044208498",
    logo: "/certs/vercel-logo.svg"
  },
  {
    title: "Next.js Pages Router",
    issuer: "Vercel",
    date: "April 2025",
    link: "https://nextjs.org/learn/certificate?course=pages-router&user=48535&certId=pages-router-48535-1746031595526",
    logo: "/certs/vercel-logo.svg"
  },
  {
    title: "React Foundations",
    issuer: "Vercel",
    date: "April 2025",
    link: "https://nextjs.org/learn/certificate?course=react-foundations&user=48535&certId=react-foundations-48535-1746022606543",
    logo: "/certs/vercel-logo.svg"
  }
]