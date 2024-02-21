import {
  PortfolioTokenApplication,
  PortfolioTokenId,
  PortfolioTokenNature,
  PortfolioTokenStatus,
  PortfolioTokenType,
} from './token'

type CommonTokenInfo = {
  decimals: number
  ticker: string // Shorthand as token e.g., ADA

  name: string
  symbol: string // Shorthand as monetary i.e., Ω

  image: string // CDN - base link to image or base64

  status: PortfolioTokenStatus // Backend meta (needs logic / starts as normal)
  application: PortfolioTokenApplication // Backend meta (based on policyId)

  tag: string
  reference: string // output
  fingerprint: string

  website: string // Full link with protocol URI
  coverBanner: string // CDN - base link to image or base64 or hex color - (discovery logic)

  originalImage: string // Base link to image or base64 - fullsize
}

type PrimaryTokenInfo = {
  id: '.'
  nature: PortfolioTokenNature.Primary
  type: PortfolioTokenType.FT
}

type SecondaryTokenInfo = {
  id: PortfolioTokenId
  nature: PortfolioTokenNature.Secondary
  type: PortfolioTokenType
}

export type PortfolioTokenInfo = CommonTokenInfo &
  (PrimaryTokenInfo | SecondaryTokenInfo)
