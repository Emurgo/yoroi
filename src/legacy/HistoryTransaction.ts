import '../yoroi-wallets'

import type {TokenEntry, TokenEntryPlain} from '../yoroi-wallets'
import type {RemoteAsset, RemoteCertificateMeta} from './types'
export const TRANSACTION_DIRECTION = {
  SENT: 'SENT',
  RECEIVED: 'RECEIVED',
  SELF: 'SELF',
  // intra-wallet
  MULTI: 'MULTI', // multi-party
}
export type TransactionDirection = typeof TRANSACTION_DIRECTION[keyof typeof TRANSACTION_DIRECTION]
export const TRANSACTION_STATUS = {
  SUCCESSFUL: 'Successful',
  PENDING: 'Pending',
  FAILED: 'Failed',
}
export type TransactionStatus = typeof TRANSACTION_STATUS[keyof typeof TRANSACTION_STATUS]
export type TransactionAssurance = 'PENDING' | 'FAILED' | 'LOW' | 'MEDIUM' | 'HIGH'
export type CommonMetadata = {
  readonly numberOfDecimals: number
  readonly ticker: null | string
  readonly longName: null | string
  readonly maxSupply: null | string
}
// recall: this is an union type in general
export type TokenMetadata = CommonMetadata & {
  readonly type: 'Cardano'
  // empty string for ADA
  readonly policyId: string
  // empty string for ADA
  readonly assetName: string
}
// Same as TokenMetadata but with non-nullable ticker
export type DefaultAssetMetadata = CommonMetadata & {
  readonly type: 'Cardano'
  // empty string for ADA
  readonly policyId: string
  // empty string for ADA
  readonly assetName: string
  readonly ticker: string
}
// equivalent to TokenRow in the yoroi extension
export type Token = {
  // tokenId: number

  /** different blockchains can support native multi-asset */
  readonly networkId: number
  readonly isDefault: boolean

  /**
   * For Ergo, this is the tokenId (box id of first input in tx)
   * for Cardano, this is policyId || assetName
   * Note: we don't use null for the primary token of the chain
   * As some blockchains have multiple primary tokens
   */
  readonly identifier: string
  readonly metadata: TokenMetadata
}
export type DefaultAsset = Token & {
  metadata: DefaultAssetMetadata
}
export type IOData = {
  address: string
  assets: Array<TokenEntry>
  amount: string
}
export type TransactionInfo = {
  id: string
  inputs: Array<IOData>
  outputs: Array<IOData>
  amount: Array<TokenEntryPlain>
  fee: Array<TokenEntryPlain> | null | undefined
  delta: Array<TokenEntryPlain>
  direction: TransactionDirection
  confirmations: number
  submittedAt: string | null | undefined
  lastUpdatedAt: string
  status: TransactionStatus
  assurance: TransactionAssurance
  tokens: Record<string, Token>
}
export const TRANSACTION_TYPE = {
  BYRON: 'byron',
  SHELLEY: 'shelley',
}
export type TransactionType = typeof TRANSACTION_TYPE[keyof typeof TRANSACTION_TYPE]
export type BaseAsset = RemoteAsset
export type Transaction = {
  id: string
  type?: TransactionType
  fee?: string
  status: TransactionStatus
  inputs: Array<{
    address: string
    amount: string
    assets: Array<BaseAsset>
  }>
  outputs: Array<{
    address: string
    amount: string
    assets: Array<BaseAsset>
  }>
  blockNum: number | null | undefined
  blockHash: string | null | undefined
  txOrdinal: number | null | undefined
  submittedAt: string | null | undefined
  lastUpdatedAt: string
  epoch: number | null | undefined
  slot: number | null | undefined
  withdrawals: Array<{
    address: string
    // hex
    amount: string
  }>
  certificates: Array<RemoteCertificateMeta>
  readonly validContract?: boolean
  readonly scriptSize?: number
  readonly collateralInputs?: Array<{
    address: string
    amount: string
    assets: Array<BaseAsset>
  }>
}
