/**
 * LEGACY API PRESERVED IMPLEMENTATIONS
 *
 * This file contains complete legacy API implementations preserved from mobile-experimental branch.
 * These are used when useBackendZero feature flag is false, bypassing backend-zero entirely.
 *
 * When useBackendZero is true, the main api.ts will use backend-zero with fallback to legacy-api/fallback.ts
 * When useBackendZero is false, this file provides standalone legacy implementations.
 */
import {StakePoolInfoRequest, StakePoolInfosAndHistories} from '@yoroi/staking'

import _ from 'lodash'

import {
  AccountStateRequest,
  AccountStateResponse,
  RawTransaction,
  TipStatusResponse,
  TxHistoryRequest,
  TxStatusRequest,
  TxStatusResponse,
} from '~/wallets/types/other'

import {handleError} from '../errors'
import {fetchDefault} from '../fetch'

type Addresses = Array<string>

const limitApiRecords = 50

export const getTipStatus = (
  baseApiUrl: string,
): Promise<TipStatusResponse> => {
  return fetchDefault('v2/tipStatus', null, baseApiUrl, 'GET')
}

export const fetchNewTxHistory = async (
  request: TxHistoryRequest,
  baseApiUrl: string,
): Promise<{isLast: boolean; transactions: Array<RawTransaction>}> => {
  const transactions = await fetchDefault<Array<RawTransaction>>(
    'v2/txs/history',
    request,
    baseApiUrl,
  )

  return {
    transactions,
    isLast: transactions.length < limitApiRecords,
  }
}

export const filterUsedAddresses = async (
  addresses: Addresses,
  baseApiUrl: string,
): Promise<Addresses> => {
  // Take a copy in case underlying data mutates during await
  const copy = [...addresses]
  const used = await fetchDefault<Addresses>(
    'v2/addresses/filterUsed',
    {addresses: copy},
    baseApiUrl,
  )
  // We need to do this so that we keep original order of addresses
  return copy.filter((addr) => used.includes(addr))
}

export const submitTransaction = async (
  signedTx: string,
  baseApiUrl: string,
): Promise<void> => {
  try {
    await fetchDefault('txs/signed', {signedTx}, baseApiUrl)
  } catch (e) {
    throw e instanceof Error ? handleError(e) : e
  }
}

export const getAccountState = (
  request: AccountStateRequest,
  baseApiUrl: string,
): Promise<AccountStateResponse> => {
  return fetchDefault('account/state', request, baseApiUrl)
}

export const bulkGetAccountState = async (
  addresses: Addresses,
  baseApiUrl: string,
): Promise<AccountStateResponse> => {
  const chunks = _.chunk(addresses, limitApiRecords)
  const responses = await Promise.all(
    chunks.map((addrs) => getAccountState({addresses: addrs}, baseApiUrl)),
  )
  return Object.assign({}, ...responses)
}

export const getPoolInfo = (
  request: StakePoolInfoRequest,
  baseApiUrl: string,
): Promise<StakePoolInfosAndHistories> => {
  return fetchDefault('pool/info', request, baseApiUrl)
}

/**
 * LEGACY ONLY: GET /v2.1/pools/poolTransitionInfo
 *
 * Pool transition configuration endpoint.
 * Returns configuration about retiring pools and their replacement pools.
 * No backend-zero equivalent exists.
 *
 * Usage: Used by pool transition feature to suggest replacement pools when current pool is retiring.
 * Migration: Keep using legacy API until backend-zero adds pool transition endpoint.
 */
export const getPoolTransitionInfo = (
  baseApiUrl: string,
): Promise<{
  new: {[groupName: string]: Array<string>}
  old: {[groupName: string]: Array<[string, number, boolean]>}
  saturationThreshold?: number
} | null> => {
  return fetchDefault('v2.1/pools/poolTransitionInfo', null, baseApiUrl, 'GET')
    .catch(() => {
      // Return null on error to match PoolInfoApi behavior
      return null
    })
}

export const fetchTxStatus = (
  request: TxStatusRequest,
  baseApiUrl: string,
): Promise<TxStatusResponse> => {
  return fetchDefault('tx/status', request, baseApiUrl)
}
