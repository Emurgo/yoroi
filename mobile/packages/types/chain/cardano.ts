import {
  Datum,
  SignedTx as SignedTxType,
  UnsignedTx as UnsignedTxType,
} from '@yoroi/tx'

import {BalanceAmounts} from '../balance/token'
import {Address, BlockHash, EpochNumber, SlotNumber, TokenId} from '../branded'
import {NumbersRatio} from '../numbers/ratio'

export type ChainCardanoProtocolParams = Readonly<{
  linearFee: {
    constant: string
    coefficient: string
  }
  minFeeReferenceScript: {
    coinsPerByte: NumbersRatio
    tierStepBytes: string
    multiplier: string
  }
  coinsPerUtxoByte: string
  poolDeposit: string
  keyDeposit: string
  epoch: number
  maxBlockBodySize: string
  maxBlockHeaderSize: string
  maxTxSize: string
  maxReferenceScriptsSize: string
  stakePoolPledgeInfluence: NumbersRatio
  monetaryExpansion: NumbersRatio
  treasuryExpansion: NumbersRatio
  minPoolCost: string
  maxExecutionUnits: {
    perTransaction: {
      memory: string
      cpu: string
    }
    perBlock: {
      memory: string
      cpu: string
    }
  }
  scriptExecutionPrices: {
    memory: NumbersRatio
    cpu: NumbersRatio
  }
  maxCollateralInputs: string
  collateralPercentage: string
  maxValueSize: string
  version: {
    major: string
    minor: string
  }
  governanceActionDeposit: string
  delegateRepresentativeDeposit: string
  constitutionalCommitteeMinSize: string
  constitutionalCommitteeMaxTermLength: string
  governanceActionLifetime: string
  delegateRepresentativeMaxIdleTime: string
  desiredNumberOfStakePools: string
  stakePoolRetirementEpochBound: string
  votingThresholds: {
    stakePool: {
      noConfidence: NumbersRatio
      committeeNormal: NumbersRatio
      committeeNoConfidence: NumbersRatio
      hardFork: NumbersRatio
      ppSecurity: NumbersRatio
    }
    delegateRep: {
      noConfidence: NumbersRatio
      committeeNormal: NumbersRatio
      committeeNoConfidence: NumbersRatio
      constitution: NumbersRatio
      hardFork: NumbersRatio
      ppNetwork: NumbersRatio
      ppEconomic: NumbersRatio
      ppTechnical: NumbersRatio
      ppGovernance: NumbersRatio
      treasury: NumbersRatio
    }
  }
}>

export type ChainCardanoBestBlock = Readonly<{
  epoch: EpochNumber
  slot: SlotNumber
  globalSlot: SlotNumber
  hash: BlockHash
  height: number
}>

// START legacy
export type CardanoUnsignedTx = CardanoTxInfo & {
  unsignedTx: UnsignedTxType
}

export type CardanoSignedTx = CardanoTxInfo & {
  signedTx: SignedTxType
}

export type CardanoEntry = {
  address: Address
  amounts: BalanceAmounts
  datum?: Datum
}

export type CardanoTxInfo = {
  entries: CardanoEntry[]
  fee: BalanceAmounts
  change: CardanoEntry[]
  metadata: CardanoMetadata
  staking: CardanoStaking
  voting: CardanoVoting
  governance: boolean
}

export type CardanoMetadata = {
  [label: string]: string
}

export type CardanoStaking = {
  registrations?: CardanoEntry[]
  deregistrations?: CardanoEntry[]
  delegations?: CardanoEntry[]
  withdrawals?: CardanoEntry[]
}

export type CardanoVoting = {
  registration?: {
    votingPublicKey: string
    stakingPublicKey: string
    rewardAddress: CardanoAddress
    nonce: number
  }
}

export type CardanoAddress = Address
export type CardanoTokenId = TokenId
// END legacy
