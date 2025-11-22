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

export const CardanoTokenId = {
  // transformers
  asFingerprint,
  asSubject,

  // helpers
  getTokenIdentity,
} as const

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

export {API_ENDPOINTS}

// Cardano wallet API types and makers
export {CardanoBackend, WalletContext, ManagedCardanoApi} from './cardano/types'
export {cardanoWalletApiMaker} from './cardano/api-maker'

// Re-export API types for convenience
export type {
  AccountStateRequest,
  AccountStateResponse,
  BackendConfig,
  FundInfoResponse,
  RawTransaction,
  RawUtxo,
  TipStatusResponse,
  TxHistoryRequest,
  TxStatusRequest,
  TxStatusResponse,
  TxSubmissionStatus,
  TxMetadata,
} from './cardano/api-types'
