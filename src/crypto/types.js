// @flow

import {
  TransactionBuilder as V4TransactionBuilder,
  Certificate as V4Certificate,
} from '@emurgo/react-native-haskell-shelley'
import {BigNumber} from 'bignumber.js'

import {MultiToken} from './MultiToken'

import type {WalletChecksum} from '@emurgo/cip4-js'
import type {RawUtxo} from '../api/types'
import type {Token} from '../types/HistoryTransaction'

export type Address = {|
  +address: string,
|}

export type Value = {|
  values: MultiToken,
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

// equivalent to CardanoAddressedUtxo in the Yoroi extension
export type AddressedUtxo = {|
  ...$ReadOnly<RawUtxo>,
  ...$ReadOnly<Addressing>,
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
  amount: MultiToken,
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

export type SendTokenList = Array<
  | $ReadOnly<{|
      token: $ReadOnly<Token>,
      amount: string, // in lovelaces
    |}>
  | $ReadOnly<{|
      token: $ReadOnly<Token>,
      shouldSendAll: true,
    |}>,
>

/**
 * wallet types
 */
export type WalletState = {|
  lastGeneratedAddressIndex: number,
|}

export type EncryptionMethod = 'BIOMETRICS' | 'SYSTEM_PIN' | 'MASTER_PASSWORD'

export type PlateResponse = {|
  addresses: Array<string>,
  accountPlate: WalletChecksum,
|}
