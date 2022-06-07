import {SignTransactionRequest} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {SignedTx, UnsignedTx} from '@emurgo/yoroi-lib-core'

export type YoroiUnsignedTx = YoroiTxInfo & {
  unsignedTx: UnsignedTx
}

export type YoroiSignedTx = YoroiTxInfo & {
  signedTx: SignedTx
}

export type YoroiTxInfo = {
  entries: YoroiEntries
  amounts: YoroiAmounts
  fee: YoroiAmounts
  change: YoroiEntries
  metadata?: YoroiMetadata
  staking?: YoroiStaking
  voting?: {
    registrations: YoroiEntries
  }
  hw?: {
    ledgerPayload?: SignTransactionRequest
    ledgerNanoCatalystRegistrationTxSignData?: {
      votingPublicKey: string
      stakingKeyPath: Array<number>
      stakingKey: string
      rewardAddress: string
      nonce: number
    }
  }
}

export type YoroiStaking = {
  registrations: YoroiEntries
  deregistrations: YoroiEntries
  delegations: YoroiEntries
  withdrawals: YoroiEntries
}

export type Address = string
export type Quantity = `${number}`
export type TokenId = string

export type YoroiEntries = {
  [address: Address]: YoroiAmounts
}

export type YoroiPrimaryEntry = {
  address: Address
  amounts: YoroiAmounts
}

export type YoroiEntry = {
  address: Address
  amounts: YoroiAmounts
}

export type YoroiAmounts = {
  [tokenId: TokenId]: Quantity
}

export type YoroiAmount = {
  tokenId: TokenId
  quantity: Quantity
}

export type YoroiMetadata = {
  [label: string]: string
}
