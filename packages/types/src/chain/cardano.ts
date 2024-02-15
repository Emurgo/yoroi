import {
  UnsignedTx as UnsignedTxType,
  SignedTx as SignedTxType,
} from '@emurgo/yoroi-lib'
import {TransferEntry} from '../transfer/state'
import {BalanceAmounts} from '../balance/token'

export type CardanoUnsignedTx = CardanoTxInfo & {
  unsignedTx: UnsignedTxType
}

export type CardanoSignedTx = CardanoTxInfo & {
  signedTx: SignedTxType
}

export type CardanoTxInfo = {
  entries: TransferEntry[]
  fee: BalanceAmounts
  change: TransferEntry[]
  metadata: CardanoMetadata
  staking: CardanoStaking
  voting: CardanoVoting
  governance: boolean
}

export type CardanoMetadata = {
  [label: string]: string
}

export type CardanoStaking = {
  registrations?: TransferEntry[]
  deregistrations?: TransferEntry[]
  delegations?: TransferEntry[]
  withdrawals?: TransferEntry[]
}

export type CardanoVoting = {
  registration?: {
    votingPublicKey: string
    stakingPublicKey: string
    rewardAddress: CardanoAddress
    nonce: number
  }
}

export type CardanoAddress = string
export type CardanoTokenId = string
