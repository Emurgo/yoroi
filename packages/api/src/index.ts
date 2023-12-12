import {appApiMaker} from './app/api/app-api-maker'
import {mockAppApi} from './app/api/app-api-maker.mocks'
import {getFrontendFees} from './app/api/frontend-fees'
import {getProtocolParams} from './cardano/api/protocol-params'
import {mockGetFrontendFees} from './app/api/frontend-fees.mocks'

import {
  isFtMetadata,
  isMetadataFile,
  isNftMetadata,
} from './cardano/api/parsers'
import {getOffChainMetadata} from './cardano/api/token-offchain-metadata'
import {getOnChainMetadatas} from './cardano/api/token-onchain-metadata'
import {mockGetOnChainMetadatas} from './cardano/api/token-onchain-metadata.mocks'
import {getTokenSupply} from './cardano/api/token-supply'
import {getTokenIdentity} from './cardano/translators/helpers/getTokenIdentity'
import {asFingerprint} from './cardano/translators/transformers/asFingerprint'
import {asSubject} from './cardano/translators/transformers/asSubject'
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
  ApiTokenIdentity,
  ApiOnChainMetadataRecord,
  ApiOffChainMetadataRecord,
  ApiProtocolParamsResult,
} from './cardano/api/types'
import {cardanoApiMaker} from './cardano/api/cardano-api-maker'
import {mockCardanoApi} from './cardano/api/cardano-api-maker.mocks'

export const CardanoTokenId = {
  // transformers
  asFingerprint,
  asSubject,

  // helpers
  getTokenIdentity,
} as const

export const AppApi = {
  getFrontendFees,
  mockGetFrontendFees,

  appApiMaker,
  mockAppApi,
} as const

export const CardanoApi = {
  getOffChainMetadata,
  getOnChainMetadatas,
  getTokenSupply,
  getProtocolParams,
  mockGetOnChainMetadatas,
  isNftMetadata,
  isFtMetadata,
  isMetadataFile,
  cardanoApiMaker,
  mockCardanoApi,
} as const

export namespace CardanoApi {
  export type OffChainMetadataRequest = ApiOffChainMetadataRequest
  export type OnChainMetadataRecord = ApiOnChainMetadataRecord
  export type OffChainMetadataResponse = ApiOffChainMetadataResponse

  export type OnChainMetadataRequest = ApiOnChainMetadataRequest
  export type OffChainMetadataRecord = ApiOffChainMetadataRecord
  export type OnChainMetadataResponse = ApiOnChainMetadataResponse

  export type TokenSupplyRequest = ApiTokeSupplyRequest
  export type TokenSupplyRecord = ApiTokenSupplyRecord

  export type TokenIdentity = ApiTokenIdentity
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

  export type ProtocolParamsResult = ApiProtocolParamsResult

  export interface api {
    getProtocolParams: () => Promise<ProtocolParamsResult>
  }
}
