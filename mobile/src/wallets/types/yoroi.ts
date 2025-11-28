import {TransactionOutput} from '@yoroi/tx'
import {Balance, Portfolio} from '@yoroi/types'

/**
 * @deprecated REMOVED: YoroiUnsignedTx and YoroiSignedTx have been removed.
 * Use UnsignedTransaction from @yoroi/tx for unsigned transactions.
 * Use Transaction (CSL) from @emurgo/cross-csl-core for signed transactions.
 */

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
  pushLinkKeys?: Readonly<{
    internal?: Readonly<{
      catalystRegistration?: Readonly<{
        mobile?: string
        extension?: string
      }>
    }>
    external?: Readonly<{
      yoroiWebsite?: string
    }>
  }>
  banners?: Readonly<{
    midnightAnnouncement?: Readonly<{
      display?: boolean
    }>
    midnightPhase2Announcement?: Readonly<{
      display?: boolean
    }>
    yoroiDrep?: Readonly<{
      display?: boolean
    }>
  }>
  popups?: Readonly<{
    midnightDistribution?: Readonly<{
      display?: boolean
    }>
    generalFeaturesAnnouncement?: Readonly<{
      display?: boolean
    }>
    poolTransitionDialog?: Readonly<{
      display?: boolean
    }>
    cardanoCardAnnouncement?: Readonly<{
      display?: boolean
    }>
    firefoxSupportAnnouncement?: Readonly<{
      display?: boolean
    }>
  }>
  features?: Readonly<{
    midnightAirdrop?: Readonly<{
      enabled: boolean
    }>
    [key: string]: unknown
  }>
  dapps?: Readonly<{
    banned?: ReadonlyArray<string>
    recommended?: ReadonlyArray<YoroiConfigRecommendedDapp>
    filters?: Readonly<{
      Media?: ReadonlyArray<string>
      Investment?: ReadonlyArray<string>
      Trading?: ReadonlyArray<string>
      Community?: ReadonlyArray<string>
    }>
  }>
  swap?: Readonly<{
    initialPair?: Readonly<{
      tokenIn?: Portfolio.Token.Id
      tokenOut?: Portfolio.Token.Id
    }>
    excludedTokens?: ReadonlyArray<Portfolio.Token.Id>
    verifiedTokens?: ReadonlyArray<Portfolio.Token.Id>
    partners?: Readonly<{
      dexhunter?: string
      muesliswap?: string
      minswap?: string
      steelswap?: string
    }>
  }>
  enableTrezorAirdrop?: boolean
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
