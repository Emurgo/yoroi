export type PortfolioTokenFile = Readonly<{
  [key: string]: unknown
  name?: string
  mediaType: string
  src: string | string[]
}>
