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
  auxiliary: YoroiAuxiliary
  other?: Record<string, unknown>
}

export type YoroiTx = {
  entries: YoroiEntries
  amounts: YoroiAmounts
  fee: YoroiAmounts
  auxiliary: YoroiAuxiliary
  change: YoroiEntries
  staking: {
    registrations: YoroiEntries
    deregistrations: YoroiEntries
    delegations: YoroiEntries
    withdrawals: YoroiEntries
  }
  voting: {
    registrations: YoroiEntries
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

export type YoroiAuxiliary = {
  [label: string]: string
}
