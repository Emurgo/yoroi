import {TransactionOutput} from '@yoroi/tx'
import {Balance, Portfolio} from '@yoroi/types'

import {CardanoTypes} from '../cardano/types'

// Legacy types - deprecated, use UnsignedTransaction and Transaction (CSL) instead
// @deprecated Use UnsignedTransaction from @yoroi/tx instead
export type YoroiUnsignedTx = YoroiTxInfo & {
  unsignedTx: CardanoTypes.UnsignedTx
}

// @deprecated Use Transaction (CSL) instead
export type YoroiSignedTx = YoroiTxInfo & {
  signedTx: CardanoTypes.SignedTx
}

// Utility type for UI - can be derived from UnsignedTransaction when needed
export type YoroiTxInfo = {
  entries: TransactionOutput[]
  fee: Balance.Amounts
  change: TransactionOutput[]
  metadata: YoroiMetadata
  staking: YoroiStaking
  voting: YoroiVoting
  governance: boolean
}

export type YoroiStaking = {
  registrations?: TransactionOutput[]
  deregistrations?: TransactionOutput[]
  delegations?: TransactionOutput[]
  withdrawals?: TransactionOutput[]
}

export type YoroiVoting = {
  registration?: {
    votingPublicKey: string
    stakingPublicKey: string
    rewardAddress: string
    nonce: number
  }
}

export type Address = string
export type TokenId = string

export type YoroiMetadata = {
  [label: string]: string
}

export type YoroiNftModerationStatus =
  | 'consent'
  | 'blocked'
  | 'approved'
  | 'pending'
  | 'manual_review'

export type YoroiConfig = Readonly<{
  pushLinkKeys: Readonly<{
    internal: Readonly<{
      catalystRegistration: Readonly<{
        mobile: string
        extension: string
      }>
    }>
    external: Readonly<{
      yoroiWebsite: string
    }>
  }>
  banners: Readonly<{
    midnightAnnouncement: Readonly<{
      display: boolean
    }>
    yoroiDrep: Readonly<{
      display: boolean
    }>
  }>
  popups: Readonly<{
    midnightDistribution: Readonly<{
      display: boolean
    }>
    generalFeaturesAnnouncement: Readonly<{
      display: boolean
    }>
    poolTransitionDialog: Readonly<{
      display: boolean
    }>
    cardanoCardAnnouncement: Readonly<{
      display: boolean
    }>
  }>
  features: Readonly<{
    airdrop: Readonly<{
      enabled: boolean
    }>
  }>
  dapps: Readonly<{
    banned: ReadonlyArray<string>
    recommended: ReadonlyArray<YoroiConfigRecommendedDapp>
    filters: Readonly<{
      Media: ReadonlyArray<string>
      Investment: ReadonlyArray<string>
      Trading: ReadonlyArray<string>
      Community: ReadonlyArray<string>
    }>
  }>
  swap: Readonly<{
    initialPair: Readonly<{
      tokenIn: Portfolio.Token.Id
      tokenOut: Portfolio.Token.Id
    }>
    excludedTokens: ReadonlyArray<Portfolio.Token.Id>
    verifiedTokens: ReadonlyArray<Portfolio.Token.Id>
    partners: Readonly<{
      dexhunter: string
      muesliswap: string
    }>
  }>
}>

export type YoroiConfigRecommendedDapp = {
  id: string
  name: string
  description: string
  category: string
  logo: string
  uri: string
  origins: ReadonlyArray<string>
  isSingleAddress?: boolean
}
