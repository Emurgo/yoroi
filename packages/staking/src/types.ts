import {
  Addressing as AddressingType,
  CardanoAddressedUtxo as CardanoAddressedUtxoType,
  MultiTokenValue as MultiTokenValueType,
  StakingKeyBalances as StakingKeyBalancesType,
  TokenEntry as TokenEntryType,
  TxMetadata as TxMetadataType,
  SignedTx as SignedTxType,
  UnsignedTx as UnsignedTxType,
} from '@emurgo/yoroi-lib'
import {WalletChecksum as WalletChecksumType} from '@emurgo/cip4-js'
import * as CoreTypes from '@emurgo/cross-csl-core'
import {AxiosRequestConfig} from 'axios'
import {Api as AppApi} from '@yoroi/types'

export namespace CardanoTypes {
  export type TxMetadata = TxMetadataType
  export type CardanoAddressedUtxo = CardanoAddressedUtxoType
  export type SignedTx = SignedTxType
  export type UnsignedTx = UnsignedTxType
  export type MultiTokenValue = MultiTokenValueType
  export type StakingKeyBalances = StakingKeyBalancesType
  export type WalletChecksum = WalletChecksumType

  export type Address = CoreTypes.Address
  export type Addressing = AddressingType
  export type AssetName = CoreTypes.AssetName
  export type BigNum = CoreTypes.BigNum
  export type Bip32PrivateKey = CoreTypes.Bip32PrivateKey
  export type Bip32PublicKey = CoreTypes.Bip32PublicKey
  export type Certificate = CoreTypes.Certificate
  export type Ed25519KeyHash = CoreTypes.Ed25519KeyHash
  export type LinearFee = CoreTypes.LinearFee
  export type MultiAsset = CoreTypes.MultiAsset
  export type PublicKey = CoreTypes.PublicKey
  export type RewardAddress = CoreTypes.RewardAddress
  export type ScriptHash = CoreTypes.ScriptHash
  export type StakeCredential = CoreTypes.Credential
  export type TransactionBuilder = CoreTypes.TransactionBuilder
  export type Value = CoreTypes.Value
  export type TokenEntry = TokenEntryType
  export type Wasm = CoreTypes.WasmModuleProxy
}

export namespace Catalyst {
  export type Api = Readonly<{
    getFundInfo: (
      fetcherConfig?: AxiosRequestConfig,
    ) => Promise<Readonly<AppApi.Response<FundInfo>>>
  }>

  export type Config = Readonly<{
    api: {
      fund: string
    }
    apps: {
      ios: string
      android: string
    }
    groups: {
      community: string
      announcements: string
    }
    media: {
      townhall: string
    }
    newsletter: string
    others: {
      ideascale: string
    }
  }>
  export type Manager = Readonly<{
    getFundInfo(): ReturnType<Api['getFundInfo']>
    fundStatus(fundInfo: FundInfo, when?: Date): FundStatus
    config: Config
  }>

  export type FundStatus = {
    registration: 'pending' | 'running' | 'done'
    voting: 'pending' | 'running' | 'done'
    results: 'pending' | 'running' | 'done'
  }

  export type FundInfo = {
    id: number
    fundName: string
    fundStartTime: Date
    fundEndTime: Date
    registrationSnapshotTime: Date
    challenges: Array<FundChallenge>
    snapshotStart: Date
    votingStart: Date
    votingEnd: Date
    tallyingEnd: Date
    resultsUrl: string
    surveyUrl: string
    votingPowerThreshold: number
  }

  export type FundChallenge = {
    id: number
    challengeType: string
    title: string
    description: string
    rewardsTotal: number
    proposersRewards: number
    challengeUrl: string
  }

  export type CatalystApiFundInfo = {
    id: number
    fund_name: string

    fund_goal: string // {timestamp: string, themes: Array<string>}

    voting_power_threshold: number
    fund_start_time: string
    fund_end_time: string
    next_fund_start_time: string
    registration_snapshot_time: string
    next_registration_snapshot_time: string
    chain_vote_plans: Array<CatalystApiChainVotePlan>
    challenges: Array<CatalystApiChallenge>
    insight_sharing_start: string
    proposal_submission_start: string
    refine_proposals_start: string
    finalize_proposals_start: string
    proposal_assessment_start: string
    assessment_qa_start: string
    snapshot_start: string
    voting_start: string
    voting_end: string
    tallying_end: string
    goals: Array<string>[]
    results_url: string
    survey_url: string
    next: CatalystApiFundNext
  }

  export type CatalystApiChainVotePlan = {
    id: number
    chain_voteplan_id: string
    chain_vote_start_time: string
    chain_vote_end_time: string
    chain_committee_end_time: string
    chain_voteplan_payload: string
    chain_vote_encryption_key: string
    fund_id: number
  }

  export type CatalystApiChallenge = {
    internal_id: number
    id: number
    challenge_type: string
    title: string
    description: string
    rewards_total: number
    proposers_rewards: number
    fund_id: number
    challenge_url: string
    highlights: any
  }

  export type CatalystApiFundNext = {
    id: number
    fund_name: string
    insight_sharing_start: string
    proposal_submission_start: string
    refine_proposals_start: string
    finalize_proposals_start: string
    proposal_assessment_start: string
    assessment_qa_start: string
    snapshot_start: string
    voting_start: string
    voting_end: string
    tallying_end: string
  }
}
