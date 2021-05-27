// @flow
import _ from 'lodash'
import {BigNumber} from 'bignumber.js'

import checkedFetch from '../fetch'
import assert from '../../utils/assert'
import {checkAndFacadeTransactionAsync} from './facade'

import type {Transaction} from '../../types/HistoryTransaction'
import type {BackendConfig} from '../../config/types'

import type {
  RawUtxo,
  TxBodiesRequest,
  TxBodiesResponse,
  ServerStatusResponse,
  BestblockResponse,
  TxHistoryRequest,
  AccountStateRequest,
  AccountStateResponse,
  PoolInfoRequest,
  PoolInfoResponse,
  FundInfoResponse,
} from '../types'

type Addresses = Array<string>

export const checkServerStatus = (
  config: BackendConfig,
): Promise<ServerStatusResponse> => checkedFetch('status', null, config, 'GET')

export const getBestBlock = (
  config: BackendConfig,
): Promise<BestblockResponse> =>
  checkedFetch('v2/bestblock', null, config, 'GET')

export const fetchNewTxHistory = async (
  request: TxHistoryRequest,
  config: BackendConfig,
): Promise<{isLast: boolean, transactions: Array<Transaction>}> => {
  assert.preconditionCheck(
    request.addresses.length <= config.TX_HISTORY_MAX_ADDRESSES,
    'fetchNewTxHistory: too many addresses',
  )
  const response = await checkedFetch('v2/txs/history', request, config)
  const transactions = await Promise.all(
    response.map(checkAndFacadeTransactionAsync),
  )
  return {
    transactions,
    isLast: response.length < config.TX_HISTORY_RESPONSE_LIMIT,
  }
}

export const filterUsedAddresses = async (
  addresses: Addresses,
  config: BackendConfig,
): Promise<Addresses> => {
  assert.preconditionCheck(
    addresses.length <= config.FILTER_USED_MAX_ADDRESSES,
    'filterUsedAddresses: too many addresses',
  )
  // Take a copy in case underlying data mutates during await
  const copy = [...addresses]
  const used = await checkedFetch(
    'v2/addresses/filterUsed',
    {addresses: copy},
    config,
  )
  // We need to do this so that we keep original order of addresses
  return copy.filter((addr) => used.includes(addr))
}

export const fetchUTXOsForAddresses = (
  addresses: Addresses,
  config: BackendConfig,
) => {
  assert.preconditionCheck(
    addresses.length <= config.FETCH_UTXOS_MAX_ADDRESSES,
    'fetchUTXOsForAddresses: too many addresses',
  )
  return checkedFetch('txs/utxoForAddresses', {addresses}, config)
}

export const bulkFetchUTXOsForAddresses = async (
  addresses: Addresses,
  config: BackendConfig,
): Promise<Array<RawUtxo>> => {
  const chunks = _.chunk(addresses, config.FETCH_UTXOS_MAX_ADDRESSES)

  const responses = await Promise.all(
    chunks.map((addrs) => fetchUTXOsForAddresses(addrs, config)),
  )
  return _.flatten(responses)
}

export const submitTransaction = (signedTx: string, config: BackendConfig) => {
  return checkedFetch('txs/signed', {signedTx}, config)
}

export const fetchUTXOSumForAddresses = (
  addresses: Addresses,
  config: BackendConfig,
): Promise<{sum: string}> => {
  assert.preconditionCheck(
    addresses.length <= config.FETCH_UTXOS_MAX_ADDRESSES,
    'fetchUTXOSumForAddresses: too many addresses',
  )
  return checkedFetch('txs/utxoSumForAddresses', {addresses}, config)
}

export const bulkFetchUTXOSumForAddresses = async (
  addresses: Addresses,
  config: BackendConfig,
): Promise<{fundedAddresses: Array<string>, sum: BigNumber}> => {
  const chunks = _.chunk(addresses, config.FETCH_UTXOS_MAX_ADDRESSES)

  const responses = await Promise.all(
    chunks.map((addrs) => fetchUTXOSumForAddresses(addrs, config)),
  )
  const sum = responses.reduce(
    (x: BigNumber, y) => x.plus(new BigNumber(y.sum || 0)),
    new BigNumber(0),
  )

  const responseUTXOAddresses = await Promise.all(
    chunks.map((addrs) => fetchUTXOsForAddresses(addrs, config)),
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
  config: BackendConfig,
): Promise<TxBodiesResponse> => {
  return checkedFetch('txs/txBodies', request, config)
}

export const getAccountState = async (
  request: AccountStateRequest,
  config: BackendConfig,
): Promise<AccountStateResponse> => {
  assert.preconditionCheck(
    request.addresses.length <= config.FETCH_UTXOS_MAX_ADDRESSES,
    'getAccountState: too many addresses',
  )
  return await checkedFetch('getAccountState', request, config)
}

export const bulkGetAccountState = async (
  addresses: Addresses,
  config: BackendConfig,
): Promise<AccountStateResponse> => {
  const chunks = _.chunk(addresses, config.FETCH_UTXOS_MAX_ADDRESSES)

  const responses = await Promise.all(
    chunks.map((addrs) => getAccountState({addresses: addrs}, config)),
  )
  return Object.assign({}, ...responses)
}

export const getPoolInfo = async (
  request: PoolInfoRequest,
  config: BackendConfig,
): Promise<PoolInfoResponse> => {
  return await checkedFetch('getPoolInfo', request, config)
}

export const getFundInfo = async (
  config: BackendConfig,
  isMainnet: boolean,
): Promise<FundInfoResponse> => {
  const prefix = isMainnet ? '' : 'api/'
  return await checkedFetch(
    `${prefix}v0/catalyst/fundInfo/`,
    null,
    config,
    'GET',
  )
}
