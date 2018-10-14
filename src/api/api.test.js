import fetch from 'node-fetch'
import moment from 'moment'

import * as api from './api'
import {ApiError} from './errors'

global.fetch = fetch

test('API: can fetch history', async () => {

  const addresses = [
    'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ7',
  ]
  const ts = moment('1970-01-01')


  // We are async
  expect.assertions(1)
  const result = await api.fetchNewTxHistory(ts, addresses)

  expect(result[0]).toMatchSnapshot({best_block_num: expect.any(String)})
})

test('API: throws ApiError', async () => {

  const addresses = []
  const ts = 'not-a-date'

  // We are async
  expect.assertions(1)

  await expect(
    api.fetchNewTxHistory(ts, addresses)
  ).rejects.toThrow(ApiError)
})
