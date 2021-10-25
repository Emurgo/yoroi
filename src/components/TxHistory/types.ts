export type TransactionDirection = 'SENT' | 'RECEIVED' | 'SELF' | 'MULTI'
export type TransactionStatus = 'SUCCESSFUL' | 'PENDING' | 'FAILED'
export type TransactionAssurance = 'PENDING' | 'FAILED' | 'LOW' | 'MEDIUM' | 'HIGH'
export type TransactionType = 'byron' | 'shelley'


export type TokenLookupKey = {
  identifier: string,
  networkId: number,
}
  
export type TokenEntry = TokenLookupKey & {
  amount: BigNumber,
}

export type TokenEntryPlain = TokenLookupKey & {
  amount: string,
  isDefault: boolean,
}

export type DefaultTokenEntry = {
  defaultNetworkId: number,
  defaultIdentifier: string,
}

export type IOData = {
  address: string,
  assets: Array<TokenEntry>,
  amount: string,
}

export type TransactionInfo = {
  id: string,
  inputs: Array<IOData>,
  outputs: Array<IOData>,
  amount: Array<TokenEntryPlain>,
  fee?: Array<TokenEntryPlain>,
  delta: Array<TokenEntryPlain>,
  direction: TransactionDirection,
  confirmations: number,
  submittedAt?: string,
  lastUpdatedAt: string,
  status: TransactionStatus,
  assurance: TransactionAssurance,
  tokens: Dict<Token>,
}

// export type BaseAsset = RemoteAsset

// export type Transaction = {|
//   id: string,
//   type?: TransactionType,
//   fee?: string,
//   status: TransactionStatus,
//   inputs: Array<{address: string, amount: string, assets: Array<BaseAsset>}>,
//   outputs: Array<{address: string, amount: string, assets: Array<BaseAsset>}>,
//   blockNum: ?number,
//   blockHash: ?string,
//   txOrdinal: ?number,
//   submittedAt: ?string,
//   lastUpdatedAt: string,
//   epoch: ?number,
//   slot: ?number,
//   withdrawals: Array<{|
//     address: string, // hex
//     amount: string,
//   |}>,
//   certificates: Array<RemoteCertificateMeta>,
//   +validContract?: boolean,
//   +scriptSize?: number,
//   +collateralInputs?: Array<{address: string, amount: string, assets: Array<BaseAsset>}>,
// |}

// export type CommonMetadata = {|
//   +numberOfDecimals: number,
//   +ticker: null | string,
//   +longName: null | string,
//   +maxSupply: null | string,
// |}

// // recall: this is an union type in general
// export type TokenMetadata = {|
//   +type: 'Cardano',
//   // empty string for ADA
//   +policyId: string,
//   // empty string for ADA
//   +assetName: string,
//   ...$ReadOnly<CommonMetadata>,
// |}

// // Same as TokenMetadata but with non-nullable ticker
// export type DefaultAssetMetadata = {|
//   +type: 'Cardano',
//   // empty string for ADA
//   +policyId: string,
//   // empty string for ADA
//   +assetName: string,
//   ...$ReadOnly<CommonMetadata>,
//   +ticker: string,
// |}

// // equivalent to TokenRow in the yoroi extension
// export type Token = {|
//   // tokenId: number
//   /** different blockchains can support native multi-asset */
//   +networkId: number,
//   +isDefault: boolean,
//   /**
//    * For Ergo, this is the tokenId (box id of first input in tx)
//    * for Cardano, this is policyId || assetName
//    * Note: we don't use null for the primary token of the chain
//    * As some blockchains have multiple primary tokens
//    */
//   +identifier: string,
//   +metadata: $ReadOnly<TokenMetadata>,
// |}

// export type DefaultAsset = {|
//   ...Token,
//   metadata: DefaultAssetMetadata,
// |}
