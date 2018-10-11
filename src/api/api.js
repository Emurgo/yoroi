import {CONFIG} from '../config'

import type {Moment} from 'moment'

type Addresses = Array<string>

// eslint-disable-next-line

const checkResponse = (response) => {
  console.log(response)
  if (response.status !== 200) {
    // TODO(ppershing): create ApiError
    throw response
  }
}

export const fetchNewTxHistory = (dateFrom: Moment, addresses: Addresses) => {
  console.log('fetchNewTxHistory')
  return fetch(
    `${CONFIG.API_ROOT}/txs/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        addresses,
        dateFrom,
      }),
    })
    .then((r) => {
      console.log('fetchNewTxHistory>>')
      checkResponse(r)
      // eslint-disable-next-line
      console.log(r.json)
      return r.json()
    }).catch((e) => {
      console.log('error')
      throw e
    })
}

