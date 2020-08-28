// @flow
import _ from 'lodash'
import {BigNumber} from 'bignumber.js'

import checkedFetch from '../fetch'
import {CONFIG} from '../../config/config'
import assert from '../../utils/assert'
import {checkAndFacadeTransactionAsync} from './facade'

import type {Transaction} from '../../types/HistoryTransaction'

import type {
  RawUtxo,
  TxBodiesRequest,
  TxBodiesResponse,
  ServerStatusResponse,
  BestblockResponse,
  TxHistoryRequest,
  AccountStateRequest,
  AccountStateResponse,
} from '../types'

const NETWORK_CONFIG = CONFIG.NETWORKS.HASKELL_SHELLEY.BACKEND

type Addresses = Array<string>

export const checkServerStatus = (): Promise<ServerStatusResponse> =>
  checkedFetch('status', null, NETWORK_CONFIG, 'GET')

export const getBestBlock = (): Promise<BestblockResponse> =>
  checkedFetch('v2/bestblock', null, NETWORK_CONFIG, 'GET')

export const fetchNewTxHistory = async (
  request: TxHistoryRequest,
): Promise<{isLast: boolean, transactions: Array<Transaction>}> => {
  assert.preconditionCheck(
    request.addresses.length <= NETWORK_CONFIG.TX_HISTORY_MAX_ADDRESSES,
    'fetchNewTxHistory: too many addresses',
  )
  const response = await checkedFetch('v2/txs/history', request, NETWORK_CONFIG)
  const transactions = await Promise.all(
    response.map(checkAndFacadeTransactionAsync),
  )
  return {
    transactions,
    isLast: response.length < NETWORK_CONFIG.TX_HISTORY_RESPONSE_LIMIT,
  }
}

export const filterUsedAddresses = async (
  addresses: Addresses,
): Promise<Addresses> => {
  assert.preconditionCheck(
    addresses.length <= NETWORK_CONFIG.FILTER_USED_MAX_ADDRESSES,
    'filterUsedAddresses: too many addresses',
  )
  // Take a copy in case underlying data mutates during await
  const copy = [...addresses]
  const used = await checkedFetch(
    'v2/addresses/filterUsed',
    {addresses: copy},
    NETWORK_CONFIG,
  )
  // We need to do this so that we keep original order of addresses
  return copy.filter((addr) => used.includes(addr))
}

export const fetchUTXOsForAddresses = (addresses: Addresses) => {
  assert.preconditionCheck(
    addresses.length <= NETWORK_CONFIG.FETCH_UTXOS_MAX_ADDRESSES,
    'fetchNewTxHistory: too many addresses',
  )
  return checkedFetch('txs/utxoForAddresses', {addresses}, NETWORK_CONFIG)
}

export const bulkFetchUTXOsForAddresses = async (
  addresses: Addresses,
): Promise<Array<RawUtxo>> => {
  const chunks = _.chunk(addresses, NETWORK_CONFIG.FETCH_UTXOS_MAX_ADDRESSES)

  const responses = await Promise.all(
    chunks.map((addrs) => fetchUTXOsForAddresses(addrs)),
  )
  return _.flatten(responses)
}

export const submitTransaction = (signedTx: string) => {
  return checkedFetch('txs/signed', {signedTx}, NETWORK_CONFIG)
}

export const fetchUTXOSumForAddresses = (
  addresses: Addresses,
): Promise<{sum: string}> => {
  assert.preconditionCheck(
    addresses.length <= NETWORK_CONFIG.FETCH_UTXOS_MAX_ADDRESSES,
    'fetchUTXOSumForAddresses: too many addresses',
  )
  return checkedFetch('txs/utxoSumForAddresses', {addresses}, NETWORK_CONFIG)
}

export const bulkFetchUTXOSumForAddresses = async (
  addresses: Addresses,
): Promise<{fundedAddresses: Array<string>, sum: BigNumber}> => {
  const chunks = _.chunk(addresses, NETWORK_CONFIG.FETCH_UTXOS_MAX_ADDRESSES)

  const responses = await Promise.all(
    chunks.map((addrs) => fetchUTXOSumForAddresses(addrs)),
  )
  const sum = responses.reduce(
    (x: BigNumber, y) => x.plus(new BigNumber(y.sum || 0)),
    new BigNumber(0),
  )

  const responseUTXOAddresses = await Promise.all(
    chunks.map((addrs) => fetchUTXOsForAddresses(addrs)),
  )

  const fundedAddresses = _.flatten(responseUTXOAddresses).map(
    (address: any) => address.receiver,
  )

  return {
    fundedAddresses: _.uniq(fundedAddresses),
    sum,
  }
}

export const getTxsBodiesForUTXOs = (
  request: TxBodiesRequest,
): Promise<TxBodiesResponse> => {
  return checkedFetch('txs/txBodies', request, NETWORK_CONFIG)
}

export const getAccountState = async (
  request: AccountStateRequest,
): Promise<AccountStateResponse> => {
  assert.preconditionCheck(
    request.addresses.length <= NETWORK_CONFIG.FETCH_UTXOS_MAX_ADDRESSES,
    'getAccountState: too many addresses',
  )
  return await checkedFetch('getAccountState', request, NETWORK_CONFIG)
}

export const bulkGetAccountState = async (
  addresses: Addresses,
): Promise<AccountStateResponse> => {
  const chunks = _.chunk(addresses, NETWORK_CONFIG.FETCH_UTXOS_MAX_ADDRESSES)

  const responses = await Promise.all(
    chunks.map((addrs) => getAccountState({addresses: addrs})),
  )
  return Object.assign({}, ...responses)
}
