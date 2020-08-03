// @flow

import {
  Certificate,
  InputOutput,
  // Transaction as V3Transaction,
  // CertificateKind,
} from 'react-native-chain-libs'
import {TransactionBuilder as V4TransactionBuilder} from 'react-native-haskell-shelley'
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

// TODO(v-almonacid): consider moving to variable path length for more
// flexibility
export type Addressing = {|
  addressing: {
    account: number,
    change: number,
    index: number,
  },
|}

export type AddressedUtxo = {|
  ...RawUtxo,
  ...Addressing,
|}

// export type Transaction = {|
//   id: string,
//   status: TransactionStatus,
//   inputs: Array<{address: string, amount: string}>,
//   outputs: Array<{address: string, amount: string}>,
//   blockNum: ?number,
//   blockHash: ?string,
//   txOrdinal: ?number,
//   submittedAt: ?string,
//   lastUpdatedAt: string,
//   epoch: ?number,
//   slot: ?number,
// |}

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
  ...Addressing,
|}

export type BaseSignRequest<T> = {|
  senderUtxos: Array<AddressedUtxo>,
  unsignedTx: T,
  changeAddr: Array<{|address: string, ...Value, ...Addressing|}>,
  certificate: void | Certificate,
|}

// Byron-era Types

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
export type V3UnsignedTxData = {|
  senderUtxos: Array<RawUtxo>,
  IOs: InputOutput,
  changeAddr: Array<{|
    address: string,
    value: void | BigNumber,
    ...Addressing,
  |}>,
|}

// similar to yoroi-frontend's V3UnsignedTxAddressedUtxoResponse
export type V3UnsignedTxAddressedUtxoData = {|
  senderUtxos: Array<AddressedUtxo>,
  IOs: InputOutput,
  changeAddr: Array<{|
    address: string,
    value: void | BigNumber,
    ...Addressing,
  |}>,
  certificate: void | Certificate,
|}

export type V3SignedTx = {|
  id: string,
  encodedTx: Uint8Array,
|}

/**
 * Haskell-Shelley-era tx types
 */

export type V4UnsignedTxUtxoResponse = {|
  senderUtxos: Array<RawUtxo>,
  txBuilder: V4TransactionBuilder,
  changeAddr: Array<{|...Address, ...Value, ...Addressing|}>,
|}

export type V4UnsignedTxAddressedUtxoResponse = {|
  senderUtxos: Array<AddressedUtxo>,
  txBuilder: V4TransactionBuilder,
  changeAddr: Array<{|...Address, ...Value, ...Addressing|}>,
|}
