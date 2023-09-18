export type PortfolioTokenInfo = {
  kind: 'ft' | 'nft'

  id: string // TODO: is set based on rawUtxo if tokens don't contain `.` it will fail (empty name)
  fingerprint: string // fingerprint is temporary since we can't use it as id for now
  group: string // for cardano policy id
  name: string // for cardano asset name

  description?: string
  image?: string // link to image
  icon?: string // base64 encoded
  mediaType?: string // image mimetype (e.g. image/png)

  decimals?: number // if null decimals are unknown
  symbol?: string // shorthand as monetary i.e Ω
  ticker?: string // shorthand as token e.g. ADA

  website?: string // link to website
}
