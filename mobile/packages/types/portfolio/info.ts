import {TokenId} from '../branded'
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

  status: PortfolioTokenStatus // Backend meta
  application: PortfolioTokenApplication // Backend meta (based on policyId)

  tag: string
  reference: string // output
  fingerprint: string
  description: string

  website: string // Full link with protocol

  originalImage: string // Base link
}

type PrimaryTokenInfo = {
  id: TokenId // Primary token ID (typically '.')
  nature: typeof PortfolioTokenNature.Primary
  type: typeof PortfolioTokenType.FT
}

type SecondaryTokenInfo = {
  id: PortfolioTokenId
  nature: typeof PortfolioTokenNature.Secondary
  type: PortfolioTokenType
}

export type PortfolioTokenInfo = CommonTokenInfo &
  (PrimaryTokenInfo | SecondaryTokenInfo)
