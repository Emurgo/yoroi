import {UnsignedTx} from '@emurgo/yoroi-lib-core'

export type YoroiUnsignedTx = {
  entries: YoroiEntries
  amounts: YoroiAmounts
  fee: YoroiAmounts
  auxiliary: YoroiAuxiliary
  change: YoroiEntries
  staking: {
    deregistrations: YoroiEntries
    withdrawals: YoroiEntries
  }
  unsignedTx: UnsignedTx
}

export type Address = string
export type Quantity = `${number}`
export type TokenId = string

export type YoroiEntries = {
  [address: Address]: YoroiAmounts
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
