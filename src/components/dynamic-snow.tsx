import dynamic from 'next/dynamic'

export const Snow = dynamic(
  () => import("@/components/snow"),
  {
    loading: () => <></>,
    ssr: true
  }
)

