// @flow
import {Logger} from '../utils/logging'
import {CONFIG} from '../config'
import {NotConnectedError, ApiError} from './errors'
import type {Moment} from 'moment'

type Addresses = Array<string>

const _checkResponse = (response, requestPayload) => {
  if (response.status !== 200) {
    Logger.debug('Bad status code from server', response)
    Logger.debug('Request payload:', requestPayload)
    throw new ApiError(response)
  }
}

type IsOnlineCallback = (boolean) => any

let _isOnlineCallback: IsOnlineCallback = (isOnline) => null

const _fetch = (path: string, payload: any) => {
  Logger.info(`API call: ${path}`)
  return (
    fetch(`${CONFIG.API_ROOT}/${path}`, {
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
          throw new NotConnectedError()
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

export const fetchNewTxHistory = (dateFrom: Moment, addresses: Addresses) => {
  return _fetch('txs/history', {addresses, dateFrom: dateFrom.toISOString()})
}

export const filterUsedAddresses = (addresses: Addresses) => {
  return _fetch('addresses/filterUsed', {addresses})
}

export const fetchUTXOsForAddresses = (addresses: Addresses) => {
  return _fetch('txs/utxoForAddresses', {addresses})
}

export const submitTransaction = (signedTx: string) => {
  return _fetch('txs/signed', {signedTx})
}
