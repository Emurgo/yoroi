import moment from 'moment'

type Addresses = Array<string>

// eslint-disable-next-line
const API_ROOT = 'https://iohk-staging.yoroiwallet.com/api'

const checkResponse = (response) => {
  if (response.status !== 200) {
    // TODO(ppershing): create ApiError
    throw response
  }
}

export const fetchNewTxHistory = (since: number, addresses: Addresses) => {
  console.log(since)
  console.log(''+moment(since))
  return fetch(
    `${API_ROOT}/txs/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        addresses,
        dateFrom: moment(since),
      }),
    })
    .then((r) => {
      checkResponse(r)
      // eslint-disable-next-line
      console.log(r.json)
      return r.json()
    })
}

