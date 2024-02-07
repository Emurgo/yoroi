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
