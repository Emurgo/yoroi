// @flow
/* eslint-disable no-console */
import {Logger} from '../utils/logging'
import {CONFIG} from '../config'
import {NotConnectedError, ApiError} from './errors'

import type {Moment} from 'moment'

type Addresses = Array<string>


const _checkResponse = (response) => {
  Logger.debug('Check response', response)
  if (response.status !== 200) {
    throw new ApiError(response)
  }
}

type IsOnlineCallback = (boolean) => any

let _isOnlineCallback: IsOnlineCallback = (isOnline) => null

const _fetch = (path: string, payload: any) => {
  Logger.info(`API call: ${path}`)
  return fetch(
    `${CONFIG.API_ROOT}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    })
    // Fetch throws only for network/dns/related errors, not http statuses
    .catch((e) => {
      Logger.info('fetch failed', e)
      // It really is TypeError according to
      // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
      if (e instanceof TypeError) {
        _isOnlineCallback(false)
        throw new NotConnectedError()
      }
      throw e
    })
    .then((r) => {
      _isOnlineCallback(true)
      Logger.debug(`API call ${path} finished`)
      _checkResponse(r)
      const response = r.json()
      Logger.debug('Response:', response)
      return response
    })
}


export const setIsOnlineCallback = (cb: IsOnlineCallback) => {
  _isOnlineCallback = cb
}

export const fetchNewTxHistory = (dateFrom: Moment, addresses: Addresses) => {
  return _fetch('txs/history', {addresses, dateFrom})
}

