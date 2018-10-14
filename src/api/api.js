// @flow
/* eslint-disable no-console */

import {CONFIG} from '../config'
import {NotConnectedError, ApiError} from './errors'

import type {Moment} from 'moment'

type Addresses = Array<string>


const checkResponse = (response) => {
  console.log(response)
  if (response.status !== 200) {
    throw new ApiError(response)
  }
}


const _fetch = (path: string, payload: any) => {
  console.log(`API call: ${path}`)
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
      // It really is TypeError according to
      // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
      if (e instanceof TypeError) {
        throw new NotConnectedError()
      }
      throw e
    })
    .then((r) => {
      console.log(`API call response: ${path}`)
      checkResponse(r)
      const response = r.json()
      console.log(response)
      return response
    })
}

export const fetchNewTxHistory = (dateFrom: Moment, addresses: Addresses) => {
  return _fetch('txs/history', {addresses, dateFrom})
}

