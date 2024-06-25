export type ApiMetadataFile = {
  name?: string
  mediaType: string
  src: string | Array<string>
  [key: string]: unknown
}

export type ApiNftMetadata = {
  name: string
  image: string | Array<string>

  // if provided it must be valid
  mediaType?: string
  description?: string | Array<string>
  files?: Array<ApiMetadataFile>

  // everything else
  [key: string]: unknown
}

export type ApiFtMetadata = {
  name: string // 1-50 bytes HR (specs say min 1, but there are entries with empty name)
  description?: string | Array<string> // 0-500 bytes HR

  // if provided it must be valid
  policy?: string // 56-120 bytes base16 used as preimage to produce a policyId
  logo?: string | Array<string> // 0-87400 bytes base64 png i.e: `data:image/png;base64,${logo}`
  decimals?: number // int 0-19
  ticker?: string // 2-9 bytes HR (specs say min 2, but there are entries with empty ticker)
  url?: string // 0-250 bytes URI

  // everything else
  [key: string]: unknown
}

export type ApiMetadataVersion = {
  version?: string
}

export type ApiTokenId = `${string}.${string}`

export type ApiFutureTokenRecords = {
  [tokenId: string]: ApiFutureToken
}
export type ApiFutureToken = {
  supply: ApiTokenSupplyRecord
  offChain: ApiOffChainMetadataRecord
  onChain: ApiOnChainMetadataRecord
}

export type ApiOffChainMetadataRequest = ReadonlyArray<ApiTokenId>
export type ApiOffChainMetadataResponse = {
  [tokenId: ApiTokenId]: ApiOffChainMetadataRecord
}
export type ApiOffChainMetadataRecord =
  | {
      tokenRegistry: Record<string, unknown> | undefined
      isValid: false
    }
  | {
      tokenRegistry: ApiTokenRegistryEntry
      isValid: true
    }

// CIP26 Token Registry
// https://github.com/cardano-foundation/cardano-token-registry#semantic-content-of-registry-entries
export type ApiTokenRegistryEntry = {
  subject: string
  name: ApiTokenRegistryProperty<string> // 1-50 bytes HR (specs say min 1, but there are entries with empty name)

  description?: ApiTokenRegistryProperty<string> // 0-500 bytes HR
  policy?: string // 56-120 bytes base16 used as preimage to produce a policyId
  logo?: ApiTokenRegistryProperty<string> // 0-87400 bytes base64 png i.e: `data:image/png;base64,${logo}`
  ticker?: ApiTokenRegistryProperty<string> // 2-9 bytes HR (specs say min 2, but there are entries with empty ticker)
  url?: ApiTokenRegistryProperty<string> // 0-250 bytes URI
  decimals?: ApiTokenRegistryProperty<number> // int 0-19
}

type ApiTokenRegistrySignature = {
  publicKey: string
  signature: string
}

export type ApiTokenRegistryProperty<T> = {
  signatures: Array<ApiTokenRegistrySignature>
  sequenceNumber: number
  value?: T
}

export type ApiOnChainMetadataRequest = ReadonlyArray<ApiTokenId>
export type ApiOnChainMetadataResponse = {
  [tokenId: ApiTokenId]: ApiOnChainMetadataRecord
}
export type ApiOnChainMetadataRecord = ApiOnChainFtMetadataResult &
  ApiOnChainNftMetadataResult

export type ApiOnChainFtMetadataResult =
  | {
      mintFtMetadata: ApiFtMetadataRecord
      mintFtRecordSelected: ApiFtMetadata
    }
  | {
      mintFtMetadata: Record<string, unknown> | undefined
      mintFtRecordSelected: undefined
    }
export type ApiOnChainNftMetadataResult =
  | {
      mintNftMetadata: ApiNftMetadataRecord
      mintNftRecordSelected: ApiNftMetadata
    }
  | {
      mintNftMetadata: Record<string, unknown> | undefined
      mintNftRecordSelected: undefined
    }

export type ApiMetadataRecord = ApiFtMetadataRecord | ApiNftMetadataRecord

export interface ApiNftRecords {
  [policyId: string]: {
    [assetName: string]: ApiNftMetadata // v1 key is utf8 `00` v2 key is hex `3030`
  }
}
export type ApiNftMetadataRecord = {
  key: '721'
  metadata: ApiMetadataVersion & ApiNftRecords
}

export interface ApiFtRecords {
  [policyId: string]: {
    [assetName: string]: ApiFtMetadata // v1 key is utf8 `00` v2 key is hex `3030`
  }
}
export type ApiFtMetadataRecord = {
  key: '20'
  metadata: ApiMetadataVersion & ApiFtRecords
}

export type ApiTokeSupplyRequest = ReadonlyArray<ApiTokenId>
export type ApiTokenSupplyResponse = {
  [tokenId: ApiTokenId]: ApiTokenSupplyRecord
}
export type ApiTokenSupplyRecord = string | null

export type ApiTokenIdentity = {
  policyId: string
  name: string
  nameHex: string
}

export type ApiProtocolParams = Readonly<{
  coinsPerUtxoByte: string
  keyDeposit: string
  linearFee: {
    coefficient: string
    constant: string
  }
  poolDeposit: string
}>
