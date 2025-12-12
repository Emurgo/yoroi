import {TokenId} from '../branded'

// PortfolioTokenId is an alias for TokenId - they represent the same concept
export type PortfolioTokenId = TokenId

export const PortfolioTokenType = {
  FT: 'ft',
  NFT: 'nft',
} as const

export type PortfolioTokenType =
  (typeof PortfolioTokenType)[keyof typeof PortfolioTokenType]

export const PortfolioTokenPropertyType = {
  Number: 'number',
  Social: 'social',
  Document: 'document',
  File: 'file',
  Image: 'image',
  Link: 'link',
  Boolean: 'boolean',
  Base64: 'base64',
  List: 'list',
  String: 'string',
  Record: 'record',
  Audio: 'audio',
  Video: 'video',
} as const

export type PortfolioTokenPropertyType =
  (typeof PortfolioTokenPropertyType)[keyof typeof PortfolioTokenPropertyType]

export const PortfolioTokenApplication = {
  Domain: 'domain',
  Music: 'music',
  Stablecoin: 'stablecoin',
  General: 'general',
  Coin: 'coin',
  Lp: 'lp',
} as const

export type PortfolioTokenApplication =
  (typeof PortfolioTokenApplication)[keyof typeof PortfolioTokenApplication]

export const PortfolioTokenSource = {
  Registry: 'registry',
  Metadata: 'metadata',
  Datum: 'datum',
  ID: 'id',
  None: 'none',
} as const

export type PortfolioTokenSource =
  (typeof PortfolioTokenSource)[keyof typeof PortfolioTokenSource]

export const PortfolioTokenNature = {
  Primary: 'primary',
  Secondary: 'secondary',
} as const

export type PortfolioTokenNature =
  (typeof PortfolioTokenNature)[keyof typeof PortfolioTokenNature]

export const PortfolioTokenStatus = {
  Accredited: 'accredited',
  Scam: 'scam',
  Invalid: 'invalid',
  Valid: 'valid',
  Unknown: 'unknown',
} as const

export type PortfolioTokenStatus =
  (typeof PortfolioTokenStatus)[keyof typeof PortfolioTokenStatus]
