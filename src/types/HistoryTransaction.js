// @flow
import {MultiToken} from '../crypto/MultiToken'

import type {RemoteCertificateMeta, RemoteAsset} from '../api/types'

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

export type CommonMetadata = {|
  +numberOfDecimals: number,
  +ticker: null | string,
  +longName: null | string,
  +maxSupply: null | string,
|}

// recall: this is an union type in general
export type TokenMetadata = {|
  +type: 'Cardano',
  // empty string for ADA
  +policyId: string,
  // empty string for ADA
  +assetName: string,
  ...$ReadOnly<CommonMetadata>,
|}

// Same as TokenMetadata but with non-nullable ticker
export type DefaultAssetMetadata = {|
  +type: 'Cardano',
  // empty string for ADA
  +policyId: string,
  // empty string for ADA
  +assetName: string,
  ...$ReadOnly<CommonMetadata>,
  +ticker: string,
|}

// equivalent to TokenRow in the yoroi extension
export type Token = {|
  // tokenId: number
  /** different blockchains can support native multi-asset */
  +networkId: number,
  +isDefault: boolean,
  /**
   * For Ergo, this is the tokenId (box id of first input in tx)
   * for Cardano, this is policyId || assetName
   * Note: we don't use null for the primary token of the chain
   * As some blockchains have multiple primary tokens
   */
  +identifier: string,
  +metadata: $ReadOnly<TokenMetadata>,
|}

export type DefaultAsset = {|
  ...Token,
  metadata: DefaultAssetMetadata,
|}

export type TransactionInfo = {|
  id: string,
  fromAddresses: Array<string>,
  toAddresses: Array<string>,
  amount: MultiToken,
  fee: ?MultiToken,
  delta: MultiToken,
  direction: TransactionDirection,
  confirmations: number,
  submittedAt: ?string,
  lastUpdatedAt: string,
  status: TransactionStatus,
  assurance: TransactionAssurance,
  tokens: Dict<Token>,
|}

export const TRANSACTION_TYPE = {
  BYRON: 'byron',
  SHELLEY: 'shelley',
}
export type TransactionType = $Values<typeof TRANSACTION_TYPE>

export type BaseAsset = RemoteAsset

export type Transaction = {|
  id: string,
  type?: TransactionType,
  fee?: string,
  status: TransactionStatus,
  inputs: Array<{address: string, amount: string, assets: Array<BaseAsset>}>,
  outputs: Array<{address: string, amount: string, assets: Array<BaseAsset>}>,
  blockNum: ?number,
  blockHash: ?string,
  txOrdinal: ?number,
  submittedAt: ?string,
  lastUpdatedAt: string,
  epoch: ?number,
  slot: ?number,
  withdrawals: Array<{|
    address: string, // hex
    amount: string,
  |}>,
  certificates: Array<RemoteCertificateMeta>,
|}
