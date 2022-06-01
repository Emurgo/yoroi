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

export type YoroiTx = {
  entries: YoroiEntries
  amounts: YoroiAmounts
  fee: YoroiAmounts
  metadata?: YoroiMetadata
  change: YoroiEntries
  staking?: {
    registrations: YoroiEntries
    deregistrations: YoroiEntries
    delegations: YoroiEntries
    withdrawals: YoroiEntries
  }
  voting?: {
    registrations: YoroiEntries
  }
  mint?: {
    nfts?: YoroiAmounts
    tokens?: YoroiAmounts
  }
  scripts?: {
    plutus?: unknown
    native?: unknown
  }
  other?: Record<string, unknown>
}

export type YoroiUnsignedTx = YoroiTx & {
  unsignedTx: UnsignedTx
}

export type YoroiSignedTx = YoroiTx & {
  signedTx: SignedTx
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
