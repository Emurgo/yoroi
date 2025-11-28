import {StakePoolInfoRequest, StakePoolInfosAndHistories} from '@yoroi/staking'
import {TransactionStatus, WalletTransaction} from '@yoroi/types'

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
import {Addresses, CardanoApiAdapter} from '../../types'
import {fetchDefault} from '../../utils/fetch'

/**
 * Internal RawTransaction type - only used within API adapters
 * This matches the format returned by legacy API
 */
type InternalRawTransaction = {
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
      id: input.id,
      address: input.address,
      amount: input.amount,
      assets: (input.assets ?? []).map((asset) => ({
        amount: asset.amount,
        tokenId: asset.tokenId as any,
        policyId: asset.policyId,
        name: asset.name,
      })),
    })),
    outputs: tx.outputs.map((output) => ({
      address: output.address,
      amount: output.amount,
      assets: (output.assets ?? []).map((asset) => ({
        amount: asset.amount,
        tokenId: asset.tokenId as any,
        policyId: asset.policyId,
        name: asset.name,
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
    certificates: tx.certificates as any,
    validContract: tx.valid_contract,
    scriptSize: tx.script_size,
    collateralInputs: (tx.collateral_inputs ?? []).map((input) => ({
      address: input.address,
      amount: input.amount,
      assets: (input.assets ?? []).map((asset) => ({
        amount: asset.amount,
        tokenId: asset.tokenId as any,
        policyId: asset.policyId,
        name: asset.name,
      })),
    })),
    memo: null,
    metadata: tx.metadata,
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
    ): Promise<{isLast: boolean; transactions: Array<WalletTransaction>}> {
      const rawTransactions = await fetchDefault<Array<InternalRawTransaction>>(
        'v2/txs/history',
        request,
        baseApiUrl,
      )

      const transactions = rawTransactions.map(transformToWalletTransaction)

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

    async submitTransaction(signedTx: string): Promise<void> {
      try {
        await fetchDefault('txs/signed', {signedTx}, baseApiUrl)
      } catch (e) {
        throw e instanceof Error ? handleError(e) : e
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
