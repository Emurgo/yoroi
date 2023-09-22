import {
  isFtMetadata,
  isMetadataFile,
  isNftMetadata,
} from './cardano/api/parsers'
import {getOffChainMetadata} from './cardano/api/token-offchain-metadata'
import {getOnChainMetadatas} from './cardano/api/token-onchain-metadata'
import {mockGetOnChainMetadatas} from './cardano/api/token-onchain-metadata.mocks'
import {getTokenSupply} from './cardano/api/token-supply'
import {
  ApiFutureToken,
  ApiFutureTokenRecords,
  ApiOffChainMetadataRequest,
  ApiOnChainMetadataRequest,
  ApiTokeSupplyRequest,
  ApiFtMetadata,
  ApiFtMetadataRecord,
  ApiFtRecords,
  ApiMetadataFile,
  ApiNftMetadata,
  ApiNftMetadataRecord,
  ApiNftRecords,
  ApiTokenSupplyResponse,
  ApiOffChainMetadataResponse,
  ApiOnChainMetadataResponse,
  ApiTokenRegistryEntry,
  ApiTokenId,
  ApiTokenSupplyRecord,
  ApiOnChainMetadataRecord,
  ApiOffChainMetadataRecord,
} from './cardano/api/types'

import {
  asFingerprint,
  getTokenIdentity,
} from './cardano/translators/formatters/cardano-token-id'

export const CardanoTokenId = {
  asFingerprint,
  getTokenIdentity,
} as const

export const CardanoApi = {
  getOffChainMetadata,
  getOnChainMetadatas,
  getTokenSupply,
  mockGetOnChainMetadatas,
  isNftMetadata,
  isFtMetadata,
  isMetadataFile,
} as const

export namespace Cardano {
  export namespace Api {
    export type OffChainMetadataRequest = ApiOffChainMetadataRequest
    export type OnChainMetadataRecord = ApiOnChainMetadataRecord
    export type OffChainMetadataResponse = ApiOffChainMetadataResponse

    export type OnChainMetadataRequest = ApiOnChainMetadataRequest
    export type OffChainMetadataRecord = ApiOffChainMetadataRecord
    export type OnChainMetadataResponse = ApiOnChainMetadataResponse

    export type TokenSupplyRequest = ApiTokeSupplyRequest
    export type TokenSupplyRecord = ApiTokenSupplyRecord
    export type TokenSupplyResponse = ApiTokenSupplyResponse

    export type FutureToken = ApiFutureToken
    export type FutureTokenRecords = ApiFutureTokenRecords

    export type FtMetadata = ApiFtMetadata
    export type FtMetadataRecord = ApiFtMetadataRecord
    export interface FtRecords extends ApiFtRecords {}
    export type TokenRegistryEntry = ApiTokenRegistryEntry

    export type NftMetadata = ApiNftMetadata
    export type NftMetadataRecord = ApiNftMetadataRecord
    export interface NftRecords extends ApiNftRecords {}

    export type MetadataFile = ApiMetadataFile
    export type TokenId = ApiTokenId
  }
}
