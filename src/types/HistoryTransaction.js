// @flow
import {
  Certificate,
  InputOutput,
  Transaction as V3Transaction,
  Value,
} from 'react-native-chain-libs'
import {BigNumber} from 'bignumber.js'

export const TRANSACTION_DIRECTION = {
  SENT: 'SENT',
  RECEIVED: 'RECEIVED',
  SELF: 'SELF', // intra-wallet
  MULTI: 'MULTI', // multi-party
}

export type TransactionDirection = $Values<typeof TRANSACTION_DIRECTION>

export const TRANSACTION_STATUS = {
  SUCCESSFUL: 'Successful',
  PENDING: 'Pending',
  FAILED: 'Failed',
}

export type TransactionStatus = $Values<typeof TRANSACTION_STATUS>
export type TransactionAssurance =
  | 'PENDING'
  | 'FAILED'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'

export type TransactionInfo = {|
  id: string,
  fromAddresses: Array<string>,
  toAddresses: Array<string>,
  amount: ?BigNumber,
  fee: ?BigNumber,
  bruttoAmount: BigNumber,
  bruttoFee: BigNumber,
  direction: TransactionDirection,
  confirmations: number,
  submittedAt: string,
  lastUpdatedAt: string,
  status: TransactionStatus,
  assurance: TransactionAssurance,
|}

export type Transaction = {|
  id: string,
  status: TransactionStatus,
  inputs: Array<{address: string, amount: string}>,
  outputs: Array<{address: string, amount: string}>,
  blockNum: ?number,
  bestBlockNum: number,
  submittedAt: string,
  lastUpdatedAt: string,
|}

export type Addressing = {|
  addressing: {
    account: number,
    change: number,
    index: number,
  },
|}

// this is equivalent to yoroi-frontend's `RemoteUnspentOutput`
export type RawUtxo = {|
  amount: string,
  receiver: string,
  tx_hash: string,
  tx_index: number,
  utxo_id: string,
|}

export type AddressedUtxo = {|
  ...RawUtxo,
  ...Addressing,
|}

export type TransactionOutput = {|
  address: string,
  value: string,
|}

export type TransactionInput = {|
  ptr: {
    id: string,
    index: number,
  },
  value: {
    address: string,
    value: string,
  },
  ...Addressing,
|}

export type PreparedTransactionData = {|
  changeAddress: string,
  fee: BigNumber,
  inputs: Array<TransactionInput>,
  outputs: Array<TransactionOutput>,
|}

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

export type BaseSignRequest<T: V3Transaction | InputOutput> = {|
  senderUtxos: Array<AddressedUtxo>,
  unsignedTx: T,
  changeAddr: Array<{|address: string, ...Value, ...Addressing|}>,
  certificate: void | Certificate,
|}

export const AMOUNT_FORMAT = {
  ADA: 'ADA',
  LOVELACE: 'LOVELACE',
}
export type AmountFormat = $Values<typeof AMOUNT_FORMAT>
