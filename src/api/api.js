// @flow
import _ from 'lodash'
import {BigNumber} from 'bignumber.js'
import DeviceInfo from 'react-native-device-info'
import {Platform} from 'react-native'

import {Logger} from '../utils/logging'
import {CONFIG, CARDANO_CONFIG} from '../config'
import {NetworkError, ApiError} from './errors'
import assert from '../utils/assert'
import {checkAndFacadeTransactionAsync} from './facade'

import type {Moment} from 'moment'
import type {
  Transaction,
  RawUtxo,
  AccountStateResponse,
  PoolInfoRequest,
  PoolInfoResponse,
  TxBodiesRequest,
  TxBodiesResponse,
  ReputationResponse,
  ServerStatusResponse,
} from '../types/HistoryTransaction'

type Addresses = Array<string>

const _checkResponse = (response, requestPayload) => {
  if (response.status !== 200) {
    Logger.debug('Bad status code from server', response.status)
    Logger.debug('Request payload:', requestPayload)
    throw new ApiError(response)
  }
}

type RequestMethod = 'POST' | 'GET'

const _fetch = (
  path: string,
  payload: ?any,
  networkConfig: any,
  method?: RequestMethod = 'POST',
) => {
  const fullPath = `${networkConfig.API_ROOT}/${path}`
  const platform =
    Platform.OS === 'android' || Platform.OS === 'ios' ? Platform.OS : '-'
  const yoroiVersion = `${platform} / ${DeviceInfo.getVersion()}`
  Logger.info(`API call: ${fullPath}`)
  return (
    fetch(fullPath, {
      method,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'yoroi-version': yoroiVersion,
        'tangata-manu': 'yoroi',
      },
      body: payload != null ? JSON.stringify(payload) : undefined,
    })
      // Fetch throws only for network/dns/related errors, not http statuses
      .catch((e) => {
        Logger.info(`API call ${path} failed`, e)
        /* It really is TypeError according to
        https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
        */
        if (e instanceof TypeError) {
          throw new NetworkError()
        }
        throw e
      })
      .then(async (r) => {
        Logger.info(`API call ${path} finished`)

        _checkResponse(r, payload)
        const response = await r.json()
        // Logger.debug('Response:', response)
        return response
      })
  )
}

export const checkServerStatus = (
  networkConfig?: any = CONFIG.CARDANO,
): Promise<ServerStatusResponse> => _fetch('status', null, networkConfig, 'GET')

export const fetchNewTxHistory = async (
  dateFrom: Moment,
  addresses: Addresses,
  networkConfig?: any = CONFIG.CARDANO,
): Promise<{isLast: boolean, transactions: Array<Transaction>}> => {
  assert.preconditionCheck(
    addresses.length <= CONFIG.API.TX_HISTORY_MAX_ADDRESSES,
    'fetchNewTxHistory: too many addresses',
  )
  const response = await _fetch(
    'txs/history',
    {
      addresses,
      dateFrom: dateFrom.toISOString(),
    },
    networkConfig,
  )

  const transactions = await Promise.all(
    response.map(checkAndFacadeTransactionAsync),
  )
  return {
    transactions,
    isLast: response.length <= CONFIG.API.TX_HISTORY_RESPONSE_LIMIT,
  }
}

export const filterUsedAddresses = async (
  addresses: Addresses,
  networkConfig?: any = CONFIG.CARDANO,
): Promise<Addresses> => {
  assert.preconditionCheck(
    addresses.length <= CONFIG.API.FILTER_USED_MAX_ADDRESSES,
    'filterUsedAddresses: too many addresses',
  )
  // Take a copy in case underlying data mutates during await
  const copy = [...addresses]
  const used = await _fetch(
    'addresses/filterUsed',
    {addresses: copy},
    networkConfig,
  )
  // We need to do this so that we keep original order of addresses
  return copy.filter((addr) => used.includes(addr))
}

export const fetchUTXOsForAddresses = (
  addresses: Addresses,
  networkConfig?: any = CONFIG.CARDANO,
) => {
  assert.preconditionCheck(
    addresses.length <= CONFIG.API.FETCH_UTXOS_MAX_ADDRESSES,
    'fetchNewTxHistory: too many addresses',
  )
  return _fetch('txs/utxoForAddresses', {addresses}, networkConfig)
}

export const bulkFetchUTXOsForAddresses = async (
  addresses: Addresses,
  networkConfig?: any = CONFIG.CARDANO,
): Promise<Array<RawUtxo>> => {
  const chunks = _.chunk(addresses, CONFIG.API.FETCH_UTXOS_MAX_ADDRESSES)

  const responses = await Promise.all(
    chunks.map((addrs) => fetchUTXOsForAddresses(addrs, networkConfig)),
  )
  return _.flatten(responses)
}

export const submitTransaction = (
  signedTx: string,
  networkConfig?: any = CONFIG.CARDANO,
) => {
  return _fetch('txs/signed', {signedTx}, networkConfig)
}

export const fetchUTXOSumForAddresses = (
  addresses: Addresses,
  networkConfig?: any = CONFIG.CARDANO,
): Promise<{sum: string}> => {
  assert.preconditionCheck(
    addresses.length <= CONFIG.API.FETCH_UTXOS_MAX_ADDRESSES,
    'fetchUTXOSumForAddresses: too many addresses',
  )
  return _fetch('txs/utxoSumForAddresses', {addresses}, networkConfig)
}

export const bulkFetchUTXOSumForAddresses = async (
  addresses: Addresses,
  networkConfig?: any = CONFIG.CARDANO,
): Promise<{fundedAddresses: Array<string>, sum: BigNumber}> => {
  const chunks = _.chunk(addresses, CONFIG.API.FETCH_UTXOS_MAX_ADDRESSES)

  const responses = await Promise.all(
    chunks.map((addrs) => fetchUTXOSumForAddresses(addrs, networkConfig)),
  )
  const sum = responses.reduce(
    (x: BigNumber, y) => x.plus(new BigNumber(y.sum || 0)),
    new BigNumber(0),
  )

  const responseUTXOAddresses = await Promise.all(
    chunks.map((addrs) => fetchUTXOsForAddresses(addrs, networkConfig)),
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
  networkConfig?: any = CONFIG.CARDANO,
): Promise<TxBodiesResponse> => {
  return _fetch('txs/txBodies', request, networkConfig)
}

export const fetchAccountState = async (
  addresses: Addresses,
  networkConfig?: any = CARDANO_CONFIG.SHELLEY,
): Promise<AccountStateResponse> => {
  assert.preconditionCheck(
    addresses.length <= CONFIG.API.FETCH_UTXOS_MAX_ADDRESSES,
    'fetchAccountState: too many addresses',
  )
  const response = await _fetch('v2/account/state', {addresses}, networkConfig)
  const mapped = {}
  for (const key of Object.keys(response)) {
    // Jormungandr returns '' when the address is valid but it hasn't appeared in the blockchain
    // edit: Jormungandr can now also return a description error when not in the blockchain
    if (response[key] === '' || response[key] === 'Account does not exist') {
      mapped[key] = {
        delegation: {pools: []},
        value: 0,
        counter: 0,
      }
    } else {
      mapped[key] = response[key]
    }
  }
  return mapped
}

export const getPoolInfo = (
  request: PoolInfoRequest,
  networkConfig?: any = CARDANO_CONFIG.SHELLEY,
): Promise<PoolInfoResponse> => {
  return _fetch('v2/pool/info', request, networkConfig)
}

export const getReputation = (
  networkConfig?: any = CARDANO_CONFIG.SHELLEY,
): Promise<ReputationResponse> => {
  return _fetch('v2/pool/reputation', null, networkConfig, 'GET')
}
