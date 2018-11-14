// @flow
import _ from 'lodash'

import {Logger} from '../utils/logging'
import {CONFIG} from '../config'
import {ConnectionError, ApiError} from './errors'
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

type IsOnlineCallback = (boolean) => any

let _isOnlineCallback: IsOnlineCallback = (isOnline) => null

const _fetch = (path: string, payload: any) => {
  Logger.info(`API call: ${path}`)
  return (
    fetch(`${CONFIG.API.ROOT}/${path}`, {
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
          _isOnlineCallback(false)
          throw new ConnectionError()
        }
        throw e
      })
      .then(async (r) => {
        _isOnlineCallback(true)
        Logger.info(`API call ${path} finished`)

        _checkResponse(r, payload)
        const response = await r.json()
        Logger.debug('Response:', response)
        return response
      })
  )
}

export const setIsOnlineCallback = (cb: IsOnlineCallback) => {
  _isOnlineCallback = cb
}

export const fetchNewTxHistory = async (
  dateFrom: Moment,
  addresses: Addresses,
): Promise<{isLast: boolean, transactions: Array<Transaction>}> => {
  assert.preconditionCheck(
    addresses.length <= CONFIG.API.TX_HISTORY_MAX_ADDRESSES,
    'fetchNewTxHistory: too many addresses',
  )
  const response = await _fetch('txs/history', {
    addresses,
    dateFrom: dateFrom.toISOString(),
  })

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
): Promise<Addresses> => {
  assert.preconditionCheck(
    addresses.length <= CONFIG.API.FILTER_USED_MAX_ADDRESSES,
    'filterUsedAddresses: too many addresses',
  )
  // Take a copy in case underlying data mutates during await
  const copy = [...addresses]
  const used = await _fetch('addresses/filterUsed', {addresses: copy})
  // We need to do this so that we keep original order of addresses
  return copy.filter((addr) => used.includes(addr))
}

export const fetchUTXOsForAddresses = (addresses: Addresses) => {
  assert.preconditionCheck(
    addresses.length <= CONFIG.API.FETCH_UTXOS_MAX_ADDRESSES,
    'fetchNewTxHistory: too many addresses',
  )
  return _fetch('txs/utxoForAddresses', {addresses})
}

export const bulkFetchUTXOsForAddresses = async (
  addresses: Array<string>,
): Promise<Array<RawUtxo>> => {
  const chunks = _.chunk(addresses, CONFIG.API.FETCH_UTXOS_MAX_ADDRESSES)

  const responses = await Promise.all(
    chunks.map((addrs) => fetchUTXOsForAddresses(addrs)),
  )
  return _.flatten(responses)
}

export const submitTransaction = (signedTx: string) => {
  return _fetch('txs/signed', {signedTx})
}
