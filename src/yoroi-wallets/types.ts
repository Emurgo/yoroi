import {SignTransactionRequest} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {SignedTx, UnsignedTx} from '@emurgo/yoroi-lib-core'

export type YoroiUnsignedTx = CardanoUnsignedTx
export type YoroiSignedTx = CardanoSignedTx

export type CardanoUnsignedTx = YoroiTxInfo & {
  type: 'cardano'
  unsignedTx: UnsignedTx
}

export type CardanoSignedTx = YoroiTxInfo & {
  signedTx: SignedTx
}

type YoroiTxInfo = {
  entries: YoroiEntries
  amounts: YoroiAmounts
  fee: YoroiAmounts
  metadata?: YoroiMetadata
  change: YoroiEntries
  staking?: YoroiStaking
  voting?: YoroiVoting
  mint?: YoroiMint
  scripts?: YoroiScripts
  hw?: {
    ledgerPayload?: SignTransactionRequest
  }
  other: Record<string, unknown>
}

export type YoroiStaking = {
  registrations: YoroiEntries
  deregistrations: YoroiEntries
  delegations: YoroiEntries
  withdrawals: YoroiEntries
}

export type YoroiVoting = {
  registrations: YoroiEntries
}

export type YoroiMint = {
  nfts: YoroiAmounts
  tokens: YoroiAmounts
}

export type YoroiScripts = {
  plutus: unknown
  native: unknown
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
