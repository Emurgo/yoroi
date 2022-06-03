import {SignTransactionRequest} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {SignedTx, UnsignedTx} from '@emurgo/yoroi-lib-core'

export type YoroiTxRequest = {
  entries: YoroiEntries
  staking: {
    registrations: YoroiEntries
    deregistrations: YoroiEntries
    delegations: YoroiEntries
    withdrawals: YoroiEntries
  }
  voting: {
    registrations: YoroiEntries
  }
  metadata: YoroiMetadata
  other?: Record<string, unknown>
}

export type YoroiUnsignedTx = {
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

export type CardanoUnsignedTx = YoroiUnsignedTx & {
  unsignedTx: UnsignedTx
}

export type CardanoSignedTx = YoroiUnsignedTx & {
  signedTx: SignedTx
}

export type YoroiSignedTx = CardanoSignedTx

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
