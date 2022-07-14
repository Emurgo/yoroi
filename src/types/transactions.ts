import {Addressing, RawUtxo} from '../legacy/types'
import {TokenEntry} from './tokens'
export type TransactionDirection = 'SENT' | 'RECEIVED' | 'SELF' | 'MULTI'
export type TransactionAssurance = 'PENDING' | 'FAILED' | 'LOW' | 'MEDIUM' | 'HIGH'

export type AddressedUtxo = RawUtxo & Addressing

export type {Addressing} from '../legacy/types'

export type IOData = {
  address: string
  amount: string
  assets: Array<TokenEntry>
}
