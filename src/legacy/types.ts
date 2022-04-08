/* eslint-disable @typescript-eslint/no-explicit-any */
import type {WalletChecksum} from '@emurgo/cip4-js'
import {
  Certificate as V4Certificate,
  TransactionBuilder as V4TransactionBuilder,
} from '@emurgo/react-native-haskell-shelley'
import {LinearFee} from '@emurgo/react-native-haskell-shelley'
import {BigNumber} from 'bignumber.js'

import type {RawUtxo} from '../../legacy/api/types'
import {MultiToken} from '../yoroi-wallets'
export type Address = {
  readonly address: string
}
export type Value = {
  values: MultiToken
}
// note(v-almonacid): this is the old addressing format used during the Byron
// era and the ITN. It was used, for instance, as the tx input format in the
// rust V1 tx sign function.
export type LegacyAddressing = {
  addressing: {
    account: number
    change: number
    index: number
  }
}
export type LegacyAddressedUtxo = RawUtxo & LegacyAddressing
export type Addressing = {
  readonly addressing: {
    readonly path: Array<number>
    readonly startLevel: number
  }
}
// equivalent to CardanoAddressedUtxo in the Yoroi extension
export type AddressedUtxo = RawUtxo & Addressing
// Byron-era Types
export type TransactionOutput = Address & {
  value: string
}
export type TransactionInput = LegacyAddressing & {
  ptr: {
    id: string
    index: number
  }
  value: Address & {
    value: string
  }
}
export type PreparedTransactionData = {
  changeAddress: string
  fee: BigNumber
  inputs: Array<TransactionInput>
  outputs: Array<TransactionOutput>
}
export type V1SignedTx = {
  cbor_encoded_tx: string
  fee: BigNumber
  changedUsed: boolean
}

/**
 * Jormungandr-era tx types
 */
// similar to yoroi-frontend's V3UnsignedTxUtxoResponse
export type V3UnsignedTxData<T> = {
  senderUtxos: Array<RawUtxo>
  IOs: T
  changeAddr: Array<
    Addressing & {
      address: string
      value: void | BigNumber
    }
  >
}
// similar to yoroi-frontend's V3UnsignedTxAddressedUtxoResponse
export type V3UnsignedTxAddressedUtxoData<T> = {
  senderUtxos: Array<AddressedUtxo>
  IOs: T
  changeAddr: Array<
    Addressing & {
      address: string
      value: void | BigNumber
    }
  >
  certificate: void | any
}

/**
 * Haskell-Shelley-era tx types
 */
export type TxOutput = Address & {
  amount: MultiToken
}
export type V4UnsignedTxUtxoResponse = {
  senderUtxos: Array<RawUtxo>
  txBuilder: V4TransactionBuilder
  changeAddr: Array<Address & Value & Addressing>
}
export type V4UnsignedTxAddressedUtxoResponse = {
  senderUtxos: Array<AddressedUtxo>
  txBuilder: V4TransactionBuilder
  changeAddr: Array<Address & Value & Addressing>
  certificates: ReadonlyArray<V4Certificate>
}

/**
 * wallet types
 */
export type WalletState = {
  lastGeneratedAddressIndex: number
}
export type EncryptionMethod = 'BIOMETRICS' | 'SYSTEM_PIN' | 'MASTER_PASSWORD'
export type PlateResponse = {
  addresses: Array<string>
  accountPlate: WalletChecksum
}
export type ProtocolParameters = {
  readonly linearFee: LinearFee
  readonly minimumUtxoVal: BigNumber
  readonly poolDeposit: BigNumber
  readonly keyDeposit: BigNumber
  readonly networkId: number
  readonly maxValueBytes?: number
  readonly maxTxBytes?: number
}
