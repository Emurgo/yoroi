import {Balance, Resolver} from '../index'
import {
  UnsignedTx as UnsignedTxType,
  Datum as DatumType,
} from '@emurgo/yoroi-lib'

export type TransferUnsignedTx = TransferTxInfo & {
  unsignedTx: UnsignedTxType
}

export type TransferTxInfo = {
  entries: TransferEntry[]
  fee: Balance.Amounts
  change: TransferEntry[]
  metadata: TransferMetadata
  staking: TransferStaking
  voting: TransferVoting
  governance: boolean
}

export type TransferEntry = {
  address: TransferAddress
  amounts: Balance.Amounts
  datum?: DatumType
}

export type TransferMetadata = {
  [label: string]: string
}

export type TransferStaking = {
  registrations?: TransferEntry[]
  deregistrations?: TransferEntry[]
  delegations?: TransferEntry[]
  withdrawals?: TransferEntry[]
}

export type TransferVoting = {
  registration?: {
    votingPublicKey: string
    stakingPublicKey: string
    rewardAddress: TransferAddress
    nonce: number
  }
}

export type TransferTarget = {
  receiver: Resolver.Receiver
  entry: TransferEntry
}

export type TransferTargets = Readonly<Array<TransferTarget>>

export type TransferAddress = string
