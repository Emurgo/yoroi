import {appApiMaker} from './app/api/app-api-maker'
import {mockAppApi} from './app/api/app-api-maker.mocks'
import {cardanoApiMaker} from './cardano/api/cardano-api-maker'
import {mockCardanoApi} from './cardano/api/cardano-api-maker.mocks'
import {API_ENDPOINTS} from './cardano/api/config'
import {
  isFtMetadata,
  isMetadataFile,
  isNftMetadata,
} from './cardano/api/parsers'
import {getProtocolParams} from './cardano/api/protocol-params'
import {getOffChainMetadata} from './cardano/api/token-offchain-metadata'
import {getOnChainMetadatas} from './cardano/api/token-onchain-metadata'
import {mockGetOnChainMetadatas} from './cardano/api/token-onchain-metadata.mocks'
import {getTokenSupply} from './cardano/api/token-supply'
import {getUtxoData} from './cardano/api/utxo-data'
import {getTokenIdentity} from './cardano/translators/helpers/getTokenIdentity'
import {asFingerprint} from './cardano/translators/transformers/asFingerprint'
import {asSubject} from './cardano/translators/transformers/asSubject'
import {
  fallbackTokenInfo,
  toAssetNameHex,
  toDisplayAssetName,
  toPolicyId,
  toTokenFingerprint,
  toTokenId,
  toTokenSubject,
  tokenInfo,
  utf8ToHex,
} from './cardano/utils/token-utils'
import {getBackendZeroUrl} from './cardano/utils/url-mapping'

export const CardanoTokenId = {
  // transformers
  asFingerprint,
  asSubject,

  // helpers
  getTokenIdentity,
} as const

export const CardanoTokenUtils = {
  tokenInfo,
  fallbackTokenInfo,
  toPolicyId,
  toDisplayAssetName,
  toAssetNameHex,
  toTokenSubject,
  toTokenId,
  toTokenFingerprint,
  utf8ToHex,
} as const

// Export token utilities directly for convenience
export {
  fallbackTokenInfo,
  toAssetNameHex,
  toDisplayAssetName,
  toPolicyId,
  toTokenFingerprint,
  toTokenId,
  toTokenSubject,
  tokenInfo,
  utf8ToHex,
}

export const AppApi = {
  appApiMaker,
  mockAppApi,
} as const

export const CardanoApi = {
  getOffChainMetadata,
  getOnChainMetadatas,
  getTokenSupply,
  getProtocolParams,
  getUtxoData,
  mockGetOnChainMetadatas,
  isNftMetadata,
  isFtMetadata,
  isMetadataFile,
  cardanoApiMaker,
  mockCardanoApi,
} as const

export {API_ENDPOINTS, getBackendZeroUrl}

// Cardano wallet API types and makers
export {cardanoWalletApiMaker} from './cardano/api-maker'
export {CardanoBackend, ManagedCardanoApi, WalletContext} from './cardano/types'

// Re-export API types for convenience
// Note: RawTransaction is now internal to API adapters and not exported
export type {
  AccountStateRequest,
  AccountStateResponse,
  BackendConfig,
  FundInfoResponse,
  RawUtxo,
  TipStatusResponse,
  TxHistoryRequest,
  TxMetadata,
  TxStatusRequest,
  TxStatusResponse,
  TxSubmissionStatus,
} from './cardano/api-types'
