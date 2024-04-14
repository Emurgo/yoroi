export type PortfolioTokenId = `${string}.${string}`

export enum PortfolioTokenType {
  FT = 'ft',
  NFT = 'nft',
}

export enum PortfolioTokenPropertyType {
  Number = 'number',
  Social = 'social',
  Document = 'document',
  File = 'file',
  Image = 'image',
  Link = 'link',
  Boolean = 'boolean',
  Base64 = 'base64',
  List = 'list',
  String = 'string',
  Record = 'record',
  Audio = 'audio',
  Video = 'video',
}

export enum PortfolioTokenApplication {
  Domain = 'domain',
  Music = 'music',
  Stablecoin = 'stablecoin',
  General = 'general',
  Coin = 'coin',
  Lp = 'lp',
}

export enum PortfolioTokenSource {
  Registry = 'registry',
  Metadata = 'metadata',
  Datum = 'datum',
  ID = 'id',
  None = 'none',
}

export enum PortfolioTokenNature {
  Primary = 'primary',
  Secondary = 'secondary',
}

export enum PortfolioTokenStatus {
  Accredited = 'accredited',
  Scam = 'scam',
  Invalid = 'invalid',
  Valid = 'valid',
  Unknown = 'unknown',
}
