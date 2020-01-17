// @flow
import _ from 'lodash'
import {BigNumber} from 'bignumber.js'

import {Logger} from '../utils/logging'
import {CONFIG} from '../config'
import {NetworkError, ApiError} from './errors'
import assert from '../utils/assert'
import {checkAndFacadeTransactionAsync} from './facade'

import type {Moment} from 'moment'
import type {Transaction, RawUtxo} from '../types/HistoryTransaction'

type Addresses = Array<string>

const _checkResponse = (response, requestPayload) => {
  if (response.status !== 200) {
    Logger.debug('Bad status code from server', response.status)
    Logger.debug('Request payload:', requestPayload)
    throw new ApiError(response)
  }
}

const _fetch = (
  path: string,
  payload: any,
  networkConfig: any = CONFIG.CARDANO,
) => {
  Logger.info(`API call: ${path}`)
  const fullPath = `${networkConfig.API_ROOT}/${path}`
  return (
    fetch(fullPath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
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
        Logger.debug('Response:', response)
        return response
      })
  )
}

export const fetchNewTxHistory = async (
  dateFrom: Moment,
  addresses: Addresses,
  networkConfig: any = CONFIG.CARDANO,
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
  networkConfig: any = CONFIG.CARDANO,
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
  networkConfig: any = CONFIG.CARDANO,
) => {
  assert.preconditionCheck(
    addresses.length <= CONFIG.API.FETCH_UTXOS_MAX_ADDRESSES,
    'fetchNewTxHistory: too many addresses',
  )
  return _fetch('txs/utxoForAddresses', {addresses}, networkConfig)
}

export const bulkFetchUTXOsForAddresses = async (
  addresses: Array<string>,
  networkConfig: any = CONFIG.CARDANO,
): Promise<Array<RawUtxo>> => {
  const chunks = _.chunk(addresses, CONFIG.API.FETCH_UTXOS_MAX_ADDRESSES)

  const responses = await Promise.all(
    chunks.map((addrs) => fetchUTXOsForAddresses(addrs, networkConfig)),
  )
  return _.flatten(responses)
}

export const submitTransaction = (signedTx: string) => {
  return _fetch('txs/signed', {signedTx})
}

export const fetchUTXOSumForAddresses = (
  addresses: Array<string>,
  networkConfig: any = CONFIG.CARDANO,
): Promise<{sum: string}> => {
  assert.preconditionCheck(
    addresses.length <= CONFIG.API.FETCH_UTXOS_MAX_ADDRESSES,
    'fetchUTXOSumForAddresses: too many addresses',
  )
  return _fetch('txs/utxoSumForAddresses', {addresses}, networkConfig)
}

export const bulkFetchUTXOSumForAddresses = async (
  addresses: Array<string>,
  networkConfig: any = CONFIG.CARDANO,
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
