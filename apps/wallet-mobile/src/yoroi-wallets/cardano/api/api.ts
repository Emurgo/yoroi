/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'assert'
import _ from 'lodash'

import type {
  AccountStateRequest,
  AccountStateResponse,
  BackendConfig,
  CurrencySymbol,
  FundInfoResponse,
  PoolInfoRequest,
  PriceResponse,
  RawTransaction,
  StakePoolInfosAndHistories,
  TipStatusResponse,
  TxHistoryRequest,
  TxStatusRequest,
  TxStatusResponse,
} from '../../types'
import {ApiError} from '../errors'
import {ServerStatus} from '../types'
import {handleError} from './errors'
import fetchDefault from './fetch'

type Addresses = Array<string>

export {getNFT} from './metadata'
export {getNFTModerationStatus} from './nftModerationStatus'
export {getTokenInfo} from './tokenRegistry'

export const checkServerStatus = (config: BackendConfig): Promise<ServerStatus> =>
  fetchDefault('status', null, config, 'GET') as any

export const getTipStatus = (config: BackendConfig): Promise<TipStatusResponse> =>
  fetchDefault('v2/tipStatus', null, config, 'GET') as unknown as Promise<TipStatusResponse>

export const fetchNewTxHistory = async (
  request: TxHistoryRequest,
  config: BackendConfig,
): Promise<{isLast: boolean; transactions: Array<RawTransaction>}> => {
  assert(request.addresses.length <= config.TX_HISTORY_MAX_ADDRESSES, 'fetchNewTxHistory: too many addresses')
  const transactions = (await fetchDefault('v2/txs/history', request, config)) as Array<RawTransaction>

  return {
    transactions,
    isLast: transactions.length < config.TX_HISTORY_RESPONSE_LIMIT,
  }
}

export const filterUsedAddresses = async (addresses: Addresses, config: BackendConfig): Promise<Addresses> => {
  assert(addresses.length <= config.FILTER_USED_MAX_ADDRESSES, 'filterUsedAddresses: too many addresses')
  // Take a copy in case underlying data mutates during await
  const copy = [...addresses]
  const used: any = await fetchDefault('v2/addresses/filterUsed', {addresses: copy}, config)
  // We need to do this so that we keep original order of addresses
  return copy.filter((addr) => used.includes(addr))
}

export const submitTransaction = async (signedTx: string, config: BackendConfig): Promise<void> => {
  try {
    await fetchDefault('txs/signed', {signedTx}, config)
  } catch (e) {
    throw e instanceof Error ? handleError(e) : e
  }
}

export const getTransactions = async (
  txids: Array<string>,
  config: BackendConfig,
): Promise<Record<string, RawTransaction>> => {
  const txs = await fetchDefault('v2/txs/get', {txHashes: txids}, config)
  const entries: Array<[string, RawTransaction]> = Object.entries(txs)

  return Object.fromEntries(entries)
}

export const getAccountState = (request: AccountStateRequest, config: BackendConfig): Promise<AccountStateResponse> => {
  assert(request.addresses.length <= config.FETCH_UTXOS_MAX_ADDRESSES, 'getAccountState: too many addresses')
  return fetchDefault('account/state', request, config)
}

export const bulkGetAccountState = async (
  addresses: Addresses,
  config: BackendConfig,
): Promise<AccountStateResponse> => {
  const chunks = _.chunk(addresses, config.FETCH_UTXOS_MAX_ADDRESSES)
  const responses = await Promise.all(chunks.map((addrs) => getAccountState({addresses: addrs}, config)))
  return Object.assign({}, ...responses)
}

export const getPoolInfo = (request: PoolInfoRequest, config: BackendConfig): Promise<StakePoolInfosAndHistories> => {
  return fetchDefault('pool/info', request, config)
}

export const getFundInfo = (config: BackendConfig, isMainnet: boolean): Promise<FundInfoResponse> => {
  const prefix = isMainnet ? '' : 'api/'
  return fetchDefault(`${prefix}v0/catalyst/fundInfo/`, null, config, 'GET') as any
}

export const fetchTxStatus = (request: TxStatusRequest, config: BackendConfig): Promise<TxStatusResponse> => {
  return fetchDefault('tx/status', request, config)
}

export const fetchCurrentPrice = async (currency: CurrencySymbol, config: BackendConfig): Promise<number> => {
  const response = (await fetchDefault('price/ADA/current', null, config, 'GET')) as unknown as PriceResponse

  if (response.error) throw new ApiError(response.error)

  return response.ticker.prices[currency]
}
