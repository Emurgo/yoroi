import {UnsignedTx} from '@emurgo/yoroi-lib-core'

export type YoroiUnsignedTx = {
  entries: YoroiEntries
  amounts: YoroiEntry
  fee: YoroiEntry
  auxiliary: YoroiAuxiliary
  unsignedTx: UnsignedTx
  change: YoroiEntries
  staking: {
    deregistrations: YoroiEntries
    withdrawals: YoroiEntries
  }
}

export type Amount = string

export type YoroiEntries = {[address: string]: YoroiEntry}
export type YoroiEntry = {[TokenId: string]: Amount}

export type YoroiAuxiliary = Record<string, unknown>
