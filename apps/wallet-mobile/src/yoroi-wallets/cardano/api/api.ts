import assert from 'assert'
import _ from 'lodash'

import type {
  AccountStateRequest,
  AccountStateResponse,
  FundInfoResponse,
  PoolInfoRequest,
  RawTransaction,
  TipStatusResponse,
  TxHistoryRequest,
  TxStatusRequest,
  TxStatusResponse,
} from '../../types/other'
import {StakePoolInfosAndHistories} from '../../types/staking'
import {ServerStatus} from '../types'
import {handleError} from './errors'
import {fetchDefault} from './fetch'

type Addresses = Array<string>

const limitApiRecords = 50
export const checkServerStatus = (baseApiUrl: string): Promise<ServerStatus> =>
  fetchDefault('status', null, baseApiUrl, 'GET')

export const getTipStatus = (baseApiUrl: string): Promise<TipStatusResponse> =>
  fetchDefault('v2/tipStatus', null, baseApiUrl, 'GET')

export const fetchNewTxHistory = async (
  request: TxHistoryRequest,
  baseApiUrl: string,
): Promise<{isLast: boolean; transactions: Array<RawTransaction>}> => {
  assert(request.addresses.length <= limitApiRecords, 'fetchNewTxHistory: too many addresses')
  const transactions = await fetchDefault<Array<RawTransaction>>('v2/txs/history', request, baseApiUrl)

  return {
    transactions,
    isLast: transactions.length < limitApiRecords,
  }
}

export const filterUsedAddresses = async (addresses: Addresses, baseApiUrl: string): Promise<Addresses> => {
  assert(addresses.length <= limitApiRecords, 'filterUsedAddresses: too many addresses')
  // Take a copy in case underlying data mutates during await
  const copy = [...addresses]
  const used = await fetchDefault<Addresses>('v2/addresses/filterUsed', {addresses: copy}, baseApiUrl)
  // We need to do this so that we keep original order of addresses
  return copy.filter((addr) => used.includes(addr))
}

export const submitTransaction = async (signedTx: string, baseApiUrl: string): Promise<void> => {
  try {
    await fetchDefault('txs/signed', {signedTx}, baseApiUrl)
  } catch (e) {
    throw e instanceof Error ? handleError(e) : e
  }
}

export const getAccountState = (request: AccountStateRequest, baseApiUrl: string): Promise<AccountStateResponse> => {
  assert(request.addresses.length <= limitApiRecords, 'getAccountState: too many addresses')
  return fetchDefault('account/state', request, baseApiUrl)
}

export const bulkGetAccountState = async (addresses: Addresses, baseApiUrl: string): Promise<AccountStateResponse> => {
  const chunks = _.chunk(addresses, limitApiRecords)
  const responses = await Promise.all(chunks.map((addrs) => getAccountState({addresses: addrs}, baseApiUrl)))
  return Object.assign({}, ...responses)
}

export const getPoolInfo = (request: PoolInfoRequest, baseApiUrl: string): Promise<StakePoolInfosAndHistories> => {
  return fetchDefault('pool/info', request, baseApiUrl)
}

export const getFundInfo = (baseApiUrl: string, isMainnet: boolean): Promise<FundInfoResponse> => {
  const prefix = isMainnet ? '' : 'api/'
  return fetchDefault(`${prefix}v0/catalyst/fundInfo/`, null, baseApiUrl, 'GET')
}

export const fetchTxStatus = (request: TxStatusRequest, baseApiUrl: string): Promise<TxStatusResponse> => {
  return fetchDefault('tx/status', request, baseApiUrl)
}
