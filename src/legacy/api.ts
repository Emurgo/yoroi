/* eslint-disable @typescript-eslint/no-explicit-any */
import {BigNumber} from 'bignumber.js'
import _ from 'lodash'

import {StakePoolInfosAndHistories} from '../types'
import {ServerStatus} from '../yoroi-wallets'
import assert from './assert'
import {checkAndFacadeTransactionAsync} from './facade'
import fetchDefault, {checkedFetch} from './fetch'
import type {Transaction} from './HistoryTransaction'
import type {BackendConfig} from './types'
import type {
  AccountStateRequest,
  AccountStateResponse,
  BestblockResponse,
  FundInfoResponse,
  PoolInfoRequest,
  RawUtxo,
  TokenInfoRequest,
  TokenInfoResponse,
  TxBodiesRequest,
  TxBodiesResponse,
  TxHistoryRequest,
  TxStatusRequest,
  TxStatusResponse,
} from './types'

type Addresses = Array<string>

export const checkServerStatus = (config: BackendConfig): Promise<ServerStatus> =>
  fetchDefault('status', null, config, 'GET') as any

export const getBestBlock = (config: BackendConfig): Promise<BestblockResponse> =>
  fetchDefault('v2/bestblock', null, config, 'GET') as any

export const fetchNewTxHistory = async (
  request: TxHistoryRequest,
  config: BackendConfig,
): Promise<{isLast: boolean; transactions: Array<Transaction>}> => {
  assert.preconditionCheck(
    request.addresses.length <= config.TX_HISTORY_MAX_ADDRESSES,
    'fetchNewTxHistory: too many addresses',
  )
  const response: any = await fetchDefault('v2/txs/history', request, config)
  const transactions = await Promise.all(response.map(checkAndFacadeTransactionAsync))
  return {
    transactions,
    isLast: response.length < config.TX_HISTORY_RESPONSE_LIMIT,
  }
}

export const filterUsedAddresses = async (addresses: Addresses, config: BackendConfig): Promise<Addresses> => {
  assert.preconditionCheck(
    addresses.length <= config.FILTER_USED_MAX_ADDRESSES,
    'filterUsedAddresses: too many addresses',
  )
  // Take a copy in case underlying data mutates during await
  const copy = [...addresses]
  const used: any = await fetchDefault('v2/addresses/filterUsed', {addresses: copy}, config)
  // We need to do this so that we keep original order of addresses
  return copy.filter((addr) => used.includes(addr))
}

export const fetchUTXOsForAddresses = (addresses: Addresses, config: BackendConfig) => {
  assert.preconditionCheck(
    addresses.length <= config.FETCH_UTXOS_MAX_ADDRESSES,
    'fetchUTXOsForAddresses: too many addresses',
  )
  return fetchDefault('txs/utxoForAddresses', {addresses}, config)
}

export const bulkFetchUTXOsForAddresses = async (
  addresses: Addresses,
  config: BackendConfig,
): Promise<Array<RawUtxo>> => {
  const chunks = _.chunk(addresses, config.FETCH_UTXOS_MAX_ADDRESSES)

  const responses = await Promise.all(chunks.map((addrs) => fetchUTXOsForAddresses(addrs, config)))
  return _.flatten(responses) as any
}

export const submitTransaction = (signedTx: string, config: BackendConfig) => {
  return fetchDefault('txs/signed', {signedTx}, config)
}

export const fetchUTXOSumForAddresses = (addresses: Addresses, config: BackendConfig): Promise<{sum: string}> => {
  assert.preconditionCheck(
    addresses.length <= config.FETCH_UTXOS_MAX_ADDRESSES,
    'fetchUTXOSumForAddresses: too many addresses',
  )
  return fetchDefault('txs/utxoSumForAddresses', {addresses}, config) as any
}

export const bulkFetchUTXOSumForAddresses = async (
  addresses: Addresses,
  config: BackendConfig,
): Promise<{fundedAddresses: Array<string>; sum: BigNumber}> => {
  const chunks = _.chunk(addresses, config.FETCH_UTXOS_MAX_ADDRESSES)

  const responses = await Promise.all(chunks.map((addrs) => fetchUTXOSumForAddresses(addrs, config)))
  const sum = responses.reduce((x: BigNumber, y) => x.plus(new BigNumber(y.sum || 0)), new BigNumber(0))

  const responseUTXOAddresses = await Promise.all(chunks.map((addrs) => fetchUTXOsForAddresses(addrs, config)))

  const fundedAddresses = _.flatten(responseUTXOAddresses).map((address: any) => address.receiver)

  return {
    fundedAddresses: _.uniq(fundedAddresses),
    sum,
  }
}

export const getTxsBodiesForUTXOs = (request: TxBodiesRequest, config: BackendConfig): Promise<TxBodiesResponse> => {
  return fetchDefault('txs/txBodies', request, config)
}

export const getAccountState = (request: AccountStateRequest, config: BackendConfig): Promise<AccountStateResponse> => {
  assert.preconditionCheck(
    request.addresses.length <= config.FETCH_UTXOS_MAX_ADDRESSES,
    'getAccountState: too many addresses',
  )
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
  return fetchDefault('getPoolInfo', request, config)
}

export const getTokenInfo = async (request: TokenInfoRequest, config: BackendConfig): Promise<TokenInfoResponse> => {
  const {tokenIds} = request
  if (config.TOKEN_INFO_SERVICE == null) {
    throw new Error('Cardano wallets should have a Token metadata provider')
  }
  const endpointRoot = `${config.TOKEN_INFO_SERVICE}/metadata`
  const responses: Array<any> = await Promise.all(
    tokenIds.map(async (tokenId) => {
      try {
        return await checkedFetch({
          endpoint: `${endpointRoot}/${tokenId}`,
          method: 'GET',
          payload: undefined,
        })
      } catch (_e) {
        return {}
      }
    }),
  )
  return responses.reduce((res, resp) => {
    if (resp && resp.subject) {
      const v: {
        policyId: string
        assetName: string
      } & {
        name?: string
        decimals?: string
        longName?: string
        ticker?: string
      } = {
        policyId: resp.subject.slice(0, 56),
        assetName: resp.subject.slice(56),
      }

      if (resp.name?.value) {
        v.name = resp.name.value
      }

      if (resp.decimals?.value) {
        v.decimals = resp.decimals.value
      }

      if (resp.description?.value) {
        v.longName = resp.name.value
      }

      if (resp.ticker?.value) {
        v.ticker = resp.ticker.value
      }

      if (v.name || v.decimals) {
        res[resp.subject] = v
      }
    }

    return res
  }, {})
}

export const getFundInfo = (config: BackendConfig, isMainnet: boolean): Promise<FundInfoResponse> => {
  const prefix = isMainnet ? '' : 'api/'
  return fetchDefault(`${prefix}v0/catalyst/fundInfo/`, null, config, 'GET') as any
}

export const fetchTxStatus = (request: TxStatusRequest, config: BackendConfig): Promise<TxStatusResponse> => {
  return fetchDefault('tx/status', request, config)
}
