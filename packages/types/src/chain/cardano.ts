import {
  UnsignedTx as UnsignedTxType,
  SignedTx as SignedTxType,
  Datum,
} from '@emurgo/yoroi-lib'

import {BalanceAmounts} from '../balance/token'

export type CardanoUnsignedTx = CardanoTxInfo & {
  unsignedTx: UnsignedTxType
}

export type CardanoSignedTx = CardanoTxInfo & {
  signedTx: SignedTxType
}

export type CardanoEntry = {
  address: string
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

export type CardanoAddress = string
export type CardanoTokenId = string
