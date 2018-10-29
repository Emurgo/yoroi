// @flow
import jestSetup from '../jestSetup'

import moment from 'moment'

import * as api from './api'
import {ApiError} from './errors'

jestSetup.setup()

describe('History API', () => {
  it('can fetch history', async () => {
    const addresses = [
      'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ7',
    ]
    const ts = moment('1970-01-01')

    // We are async
    expect.assertions(1)
    const result = await api.fetchNewTxHistory(ts, addresses)

    // $FlowFixMe it seems like toMatchSnapshot is badly typed
    expect(result.transactions[0]).toMatchSnapshot({
      best_block_num: expect.any(String),
    })
  })

  it('throws ApiError on bad request', async () => {
    const addresses = []
    // mock moment
    const ts = {toISOString: () => 'not-a-date'}

    // We are async
    expect.assertions(1)

    await expect(api.fetchNewTxHistory(ts, addresses)).rejects.toThrow(ApiError)
  })

  it('filters used addresses', async () => {
    const addresses = [
      'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ7',
      'Ae2tdPwUPEZ8wGxWm9VbZXFJcgLeKQJWKqREVEtHXYdqsqc4bLeGqjSwrtu',
      'Ae2tdPwUPEZ6T9qZxpao8ciAgg6ahjHRq2jV45ndZ4oPXAwrTYqN9NGUPh4',
      'Ae2tdPwUPEZN7jAbQNXXGivhavp4nSsmYtCebTcnuUmXuWDXtM3bgJzugrY',
    ]
    const used = [
      'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ7',
      'Ae2tdPwUPEZ8wGxWm9VbZXFJcgLeKQJWKqREVEtHXYdqsqc4bLeGqjSwrtu',
      'Ae2tdPwUPEZ6T9qZxpao8ciAgg6ahjHRq2jV45ndZ4oPXAwrTYqN9NGUPh4',
    ]

    expect.assertions(1)
    const result = await api.filterUsedAddresses(addresses)
    expect(result).toEqual(used)
  })

  it('keeps order in filterUsedAddresses', async () => {
    const addresses = [
      'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ7',
      'Ae2tdPwUPEZ8uXdGbucR1mByMcCDqwheTziFH9S3hPXJU741K6NprZ3jKFJ',
      'Ae2tdPwUPEZAyT9PgRp751Gv8UaEzaeSuNQzDC2nZzvukFBHyLEZ9usP4YR',
    ]

    expect.assertions(2)

    const result1 = await api.filterUsedAddresses(addresses)
    expect(result1).toEqual(addresses)

    addresses.reverse()

    const result2 = await api.filterUsedAddresses(addresses)
    expect(result2).toEqual(addresses)
  })
})
