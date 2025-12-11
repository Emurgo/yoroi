import {getLogger} from '@yoroi/common'
import {
  RemoteCertificateMeta,
  StakePoolInfoRequest,
  StakePoolInfosAndHistories,
} from '@yoroi/staking'
import {
  Address,
  Amount,
  AssetName,
  BalanceQuantity,
  BlockHash,
  Branded,
  EpochNumber,
  PolicyId,
  Portfolio,
  SlotNumber,
  TokenId,
  TransactionCborBase64,
  TransactionHash,
  TransactionStatus,
  UtxoId,
  WalletTransaction,
} from '@yoroi/types'

import {freeze} from 'immer'
import _ from 'lodash'

import {
  AccountStateRequest,
  AccountStateResponse,
  TipStatusResponse,
  TxHistoryRequest,
  TxStatusRequest,
  TxStatusResponse,
} from '../../api-types'
import {handleError} from '../../errors'
import {Addresses, CardanoApiAdapter, WalletContext} from '../../types'
import {fetchDefault} from '../../utils/fetch'

const logger = getLogger()

/**
 * Internal RawTransaction type - only used within API adapters
 * This matches the format returned by legacy API
 */
type InternalRawTransaction = {
  readonly type: 'byron' | 'shelley'
  readonly fee?: Amount
  readonly hash: TransactionHash
  readonly last_update: string
  readonly tx_state: string
  readonly inputs: Array<{
    readonly address: Address
    readonly amount: BalanceQuantity
    readonly assets: Array<{
      readonly tokenId: Portfolio.Token.Id
      readonly policyId: PolicyId
      readonly name: string
      readonly amount: BalanceQuantity
    }>
    readonly id?: UtxoId
    readonly index?: number
    readonly txHash?: TransactionHash
  }>
  readonly outputs: Array<{
    readonly address: Address
    readonly amount: BalanceQuantity
    readonly assets: Array<{
      readonly tokenId: Portfolio.Token.Id
      readonly policyId: PolicyId
      readonly name: string
      readonly amount: BalanceQuantity
    }>
  }>
  readonly withdrawals: Array<{
    readonly address: Address
    readonly amount: Amount
  }>
  readonly certificates: Array<unknown>
  readonly valid_contract?: boolean
  readonly script_size?: number
  readonly collateral_inputs?: Array<{
    readonly address: Address
    readonly amount: BalanceQuantity
    readonly assets: Array<{
      readonly tokenId: Portfolio.Token.Id
      readonly policyId: PolicyId
      readonly name: string
      readonly amount: BalanceQuantity
    }>
  }>
  readonly metadata?: Array<{
    label: string
    map_json?: Record<string, unknown> | Array<unknown>
    text_scalar?: string | null
  }>
  readonly block_num?: number
  readonly block_hash?: BlockHash
  readonly tx_ordinal?: number
  readonly time?: string
  readonly epoch?: EpochNumber
  readonly slot?: SlotNumber
}

/**
 * Transform internal RawTransaction to WalletTransaction
 */
function transformToWalletTransaction(
  tx: InternalRawTransaction,
): WalletTransaction {
  return {
    id: tx.hash,
    type: tx.type,
    fee: tx.fee ?? undefined,
    status: tx.tx_state as TransactionStatus,
    inputs: tx.inputs.map((input) => ({
      id: input.id ? (input.id as unknown as TransactionHash) : undefined,
      address: input.address,
      amount: input.amount as BalanceQuantity,
      assets: (input.assets ?? []).map((asset) => ({
        amount: asset.amount as BalanceQuantity,
        tokenId: asset.tokenId as TokenId,
        policyId: asset.policyId,
        name: asset.name as unknown as AssetName,
      })),
    })),
    outputs: tx.outputs.map((output) => ({
      address: output.address,
      amount: output.amount as BalanceQuantity,
      assets: (output.assets ?? []).map((asset) => ({
        amount: asset.amount as BalanceQuantity,
        tokenId: asset.tokenId as TokenId,
        policyId: asset.policyId,
        name: asset.name as unknown as AssetName,
      })),
    })),
    lastUpdatedAt: tx.last_update,
    submittedAt: tx.time ?? null,
    blockNum: tx.block_num ?? null,
    blockHash: tx.block_hash ?? null,
    txOrdinal: tx.tx_ordinal ?? null,
    epoch: tx.epoch ?? null,
    slot: tx.slot ?? null,
    withdrawals: tx.withdrawals,
    certificates: tx.certificates as Array<RemoteCertificateMeta>,
    validContract: tx.valid_contract,
    scriptSize: tx.script_size,
    collateralInputs: (tx.collateral_inputs ?? []).map((input) => ({
      address: input.address,
      amount: input.amount as BalanceQuantity,
      assets: (input.assets ?? []).map((asset) => ({
        amount: asset.amount as BalanceQuantity,
        tokenId: asset.tokenId as TokenId,
        policyId: asset.policyId,
        name: asset.name as unknown as AssetName,
      })),
    })),
    memo: null,
    metadata: tx.metadata as WalletTransaction['metadata'],
  }
}

const limitApiRecords = 50

export const legacyApiMaker = ({
  baseApiUrl,
}: {
  baseApiUrl: string
}): CardanoApiAdapter => {
  return freeze({
    async getTipStatus(): Promise<TipStatusResponse> {
      return fetchDefault('v2/tipStatus', null, baseApiUrl, 'GET')
    },

    async fetchNewTxHistory(
      request: TxHistoryRequest,
      _walletContext?: WalletContext,
    ): Promise<{isLast: boolean; transactions: Array<WalletTransaction>}> {
      // Legacy API returns raw transaction data with string types
      const rawTransactions = await fetchDefault<
        Array<{
          readonly type: 'byron' | 'shelley'
          readonly fee?: string
          readonly hash: string
          readonly last_update: string
          readonly tx_state: string
          readonly inputs: Array<{
            readonly address: string
            readonly amount: string
            readonly assets: Array<{
              readonly tokenId: string
              readonly policyId: string
              readonly name: string
              readonly amount: string
            }>
            readonly id?: string
            readonly index?: number
            readonly txHash?: string
          }>
          readonly outputs: Array<{
            readonly address: string
            readonly amount: string
            readonly assets: Array<{
              readonly tokenId: string
              readonly policyId: string
              readonly name: string
              readonly amount: string
            }>
          }>
          readonly withdrawals: Array<{
            readonly address: string
            readonly amount: string
          }>
          readonly certificates: Array<unknown>
          readonly valid_contract?: boolean
          readonly script_size?: number
          readonly collateral_inputs?: Array<{
            readonly address: string
            readonly amount: string
            readonly assets: Array<{
              readonly tokenId: string
              readonly policyId: string
              readonly name: string
              readonly amount: string
            }>
          }>
          readonly metadata?: Array<{
            label: string
            map_json?: Record<string, unknown> | Array<unknown>
            text_scalar?: string | null
          }>
          readonly block_num?: number
          readonly block_hash?: string
          readonly tx_ordinal?: number
          readonly time?: string
          readonly epoch?: number
          readonly slot?: number
        }>
      >('v2/txs/history', request, baseApiUrl)

      // Transform raw API response to InternalRawTransaction with branded types
      const transactions: WalletTransaction[] = rawTransactions.map((tx) => {
        const internalTx: InternalRawTransaction = {
          type: tx.type,
          fee: tx.fee ? Branded.asBalanceQuantity(tx.fee) : undefined,
          hash: Branded.asTransactionHash(tx.hash),
          last_update: tx.last_update,
          tx_state: tx.tx_state,
          inputs: tx.inputs.map((input) => ({
            address: Branded.asAddress(input.address),
            amount: Branded.asBalanceQuantity(input.amount),
            assets: input.assets.map((asset) => ({
              tokenId: asset.tokenId as Portfolio.Token.Id,
              policyId: Branded.asPolicyId(asset.policyId),
              name: asset.name as unknown as AssetName,
              amount: Branded.asBalanceQuantity(asset.amount),
            })),
            id: input.id ? Branded.asUtxoId(input.id) : undefined,
            index: input.index,
            txHash: input.txHash
              ? Branded.asTransactionHash(input.txHash)
              : undefined,
          })),
          outputs: tx.outputs.map((output) => ({
            address: Branded.asAddress(output.address),
            amount: Branded.asBalanceQuantity(output.amount),
            assets: output.assets.map((asset) => ({
              tokenId: asset.tokenId as Portfolio.Token.Id,
              policyId: Branded.asPolicyId(asset.policyId),
              name: asset.name as unknown as AssetName,
              amount: Branded.asBalanceQuantity(asset.amount),
            })),
          })),
          withdrawals: tx.withdrawals.map((w) => ({
            address: Branded.asAddress(w.address),
            amount: Branded.asBalanceQuantity(w.amount),
          })),
          certificates: tx.certificates,
          valid_contract: tx.valid_contract,
          script_size: tx.script_size,
          collateral_inputs: tx.collateral_inputs?.map((input) => ({
            address: Branded.asAddress(input.address),
            amount: Branded.asBalanceQuantity(input.amount),
            assets: input.assets.map((asset) => ({
              tokenId: asset.tokenId as Portfolio.Token.Id,
              policyId: Branded.asPolicyId(asset.policyId),
              name: asset.name as unknown as AssetName,
              amount: Branded.asBalanceQuantity(asset.amount),
            })),
          })),
          metadata: tx.metadata,
          block_num: tx.block_num,
          block_hash: tx.block_hash
            ? Branded.asBlockHash(tx.block_hash)
            : undefined,
          tx_ordinal: tx.tx_ordinal,
          time: tx.time,
          epoch:
            tx.epoch !== undefined
              ? Branded.asEpochNumber(tx.epoch)
              : undefined,
          slot:
            tx.slot !== undefined ? Branded.asSlotNumber(tx.slot) : undefined,
        }
        return transformToWalletTransaction(internalTx)
      })

      return {
        transactions,
        isLast: transactions.length < limitApiRecords,
      }
    },

    async filterUsedAddresses(addresses: Addresses): Promise<Addresses> {
      const copy = [...addresses]
      const used = await fetchDefault<Addresses>(
        'v2/addresses/filterUsed',
        {addresses: copy},
        baseApiUrl,
      )
      return copy.filter((addr) => used.includes(addr))
    },

    async submitTransaction(signedTx: TransactionCborBase64): Promise<void> {
      const txStr = typeof signedTx === 'string' ? signedTx : signedTx
      try {
        await fetchDefault('txs/signed', {signedTx: txStr}, baseApiUrl)
      } catch (e) {
        const error = e instanceof Error ? handleError(e) : e
        logger.error('legacyApi.submitTransaction: HTTP request failed', {
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
        })
        throw error
      }
    },

    async getAccountState(
      request: AccountStateRequest,
    ): Promise<AccountStateResponse> {
      return fetchDefault('account/state', request, baseApiUrl)
    },

    async bulkGetAccountState(
      addresses: Addresses,
    ): Promise<AccountStateResponse> {
      const chunks = _.chunk(addresses, limitApiRecords)
      const responses = await Promise.all(
        chunks.map((addrs) => this.getAccountState({addresses: addrs})),
      )
      return Object.assign({}, ...responses)
    },

    async getPoolInfo(
      request: StakePoolInfoRequest,
    ): Promise<StakePoolInfosAndHistories> {
      return fetchDefault('pool/info', request, baseApiUrl)
    },

    async fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse> {
      return fetchDefault('tx/status', request, baseApiUrl)
    },

    async checkServerStatus(): Promise<{
      isServerOk: boolean
      serverTime: number
    }> {
      return fetchDefault('status', null, baseApiUrl, 'GET')
    },

    async getFundInfo(): Promise<{
      currentFund: {
        id: number
        registrationStart: string
        registrationEnd: string
        votingStart?: string
        votingEnd?: string
        votingPowerThreshold: string
      } | null
      nextFund: {
        id: number
        registrationStart: string
        registrationEnd: string
        votingStart?: string
        votingEnd?: string
        votingPowerThreshold: string
      } | null
    }> {
      // Note: isMainnet needs to be passed, but we'll determine from baseApiUrl
      const isMainnet =
        !baseApiUrl.includes('testnet') &&
        !baseApiUrl.includes('preprod') &&
        !baseApiUrl.includes('preview')
      const prefix = isMainnet ? '' : 'api/'
      return fetchDefault(
        `${prefix}v0/catalyst/fundInfo/`,
        null,
        baseApiUrl,
        'GET',
      )
    },
  } as CardanoApiAdapter)
}
