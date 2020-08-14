// @flow

import {
  TransactionBuilder as V4TransactionBuilder,
  Certificate as V4Certificate,
} from 'react-native-haskell-shelley'
import {BigNumber} from 'bignumber.js'

import type {RawUtxo} from '../api/types'

export type Address = {|
  +address: string,
|}

export type Value = {|
  /**
   * note: an undefined value is different than a value of 0
   * since you can have a UTXO with a value of 0
   * which is different from having no UTXO at all
   */
  +value: void | BigNumber,
|}

// note(v-almonacid): this is the old addressing format used during the Byron
// era and the ITN. It was used, for instance, as the tx input format in the
// rust V1 tx sign function.
export type LegacyAddressing = {|
  addressing: {
    account: number,
    change: number,
    index: number,
  },
|}

export type LegacyAddressedUtxo = {|
  ...RawUtxo,
  ...LegacyAddressing,
|}

export type Addressing = {|
  +addressing: {|
    +path: Array<number>,
    +startLevel: number,
  |},
|}

export type AddressedUtxo = {|
  ...RawUtxo,
  ...Addressing,
|}

export type BaseSignRequest<T> = {|
  senderUtxos: Array<AddressedUtxo>,
  unsignedTx: T,
  changeAddr: Array<{|address: string, ...Value, ...Addressing|}>,
  certificate: void | any,
|}

export type SignedTx = {|
  id: string,
  encodedTx: Uint8Array,
|}

// Byron-era Types

export type TransactionOutput = {|
  ...Address,
  value: string,
|}

export type TransactionInput = {|
  ptr: {
    id: string,
    index: number,
  },
  value: {
    ...Address,
    value: string,
  },
  ...LegacyAddressing,
|}

export type PreparedTransactionData = {|
  changeAddress: string,
  fee: BigNumber,
  inputs: Array<TransactionInput>,
  outputs: Array<TransactionOutput>,
|}

export type V1SignedTx = {
  cbor_encoded_tx: string,
  fee: BigNumber,
  changedUsed: boolean,
}

/**
 * Jormungandr-era tx types
 */

// similar to yoroi-frontend's V3UnsignedTxUtxoResponse
export type V3UnsignedTxData<T> = {|
  senderUtxos: Array<RawUtxo>,
  IOs: T,
  changeAddr: Array<{|
    address: string,
    value: void | BigNumber,
    ...Addressing,
  |}>,
|}

// similar to yoroi-frontend's V3UnsignedTxAddressedUtxoResponse
export type V3UnsignedTxAddressedUtxoData<T> = {|
  senderUtxos: Array<AddressedUtxo>,
  IOs: T,
  changeAddr: Array<{|
    address: string,
    value: void | BigNumber,
    ...Addressing,
  |}>,
  certificate: void | any,
|}

/**
 * Haskell-Shelley-era tx types
 */

export type TxOutput = {|
  ...Address,
  amount: string,
|}

export type V4UnsignedTxUtxoResponse = {|
  senderUtxos: Array<RawUtxo>,
  txBuilder: V4TransactionBuilder,
  changeAddr: Array<{|...Address, ...Value, ...Addressing|}>,
|}

export type V4UnsignedTxAddressedUtxoResponse = {|
  senderUtxos: Array<AddressedUtxo>,
  txBuilder: V4TransactionBuilder,
  changeAddr: Array<{|...Address, ...Value, ...Addressing|}>,
  certificates: $ReadOnlyArray<V4Certificate>,
|}

/**
 * wallet types
 */
export type WalletState = {|
  lastGeneratedAddressIndex: number,
|}

export type EncryptionMethod = 'BIOMETRICS' | 'SYSTEM_PIN' | 'MASTER_PASSWORD'
