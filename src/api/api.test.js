// @flow
/* eslint-env jest */
import jestSetup from '../jestSetup'

import api from './'
import {ApiError, ApiHistoryError} from './errors'

jestSetup.setup()
jest.setTimeout(30 * 1000)

describe('History API', () => {
  it('can fetch history', async () => {
    const bestBlock = await api.getBestBlock()
    const addresses = [
      'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ7',
    ]
    const request = {
      addresses,
      untilBlock: bestBlock.hash != null ? bestBlock.hash : '',
    }

    // We are async
    expect.assertions(1)
    const result = await api.fetchNewTxHistory(request)

    expect(result.transactions[0]).toMatchSnapshot({
      blockNum: expect.any(Number),
      lastUpdatedAt: expect.any(String), // these fields may change (e.g. after restarting a node)
      submittedAt: expect.any(String),
    })
  })

  it('throws ApiError on bad request', async () => {
    const addresses = []
    const request = {
      addresses,
      untilBlock: '',
    }

    // We are async
    expect.assertions(1)

    await expect(api.fetchNewTxHistory(request)).rejects.toThrow(ApiError)
  })

  it('throws ApiHistoryError on bad request', async () => {
    const addresses = [
      'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ7',
    ]
    const request = {
      addresses,
      untilBlock:
        '6ac8fc52c0a9587357c7a1e91bbe8c744127cc107947c05616635ccc7c7701fc',
      after: {
        block:
          '5ec2d5241112cf8cd624842350fcd402fd66f4a6c6c3605465c7a98dc1914cad',
        // fake tx hash, should give REFERENCE_TX_NOT_FOUND
        tx: 'abca63ff6e71784779e30533b764966819003214e04e236a741af540eff1f895',
      },
    }

    // We are async
    expect.assertions(1)

    await expect(api.fetchNewTxHistory(request)).rejects.toThrow(
      ApiHistoryError,
    )
  })

  it('filters used addresses', async () => {
    const addresses = [
      'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ7',
      'Ae2tdPwUPEZ8wGxWm9VbZXFJcgLeKQJWKqREVEtHXYdqsqc4bLeGqjSwrtu',
      'Ae2tdPwUPEZ6T9qZxpao8ciAgg6ahjHRq2jV45ndZ4oPXAwrTYqN9NGUPh4',
      'Ae2tdPwUPEYzFrD5QSQ8NPHEJ8reecZkch5tT8wFAAYu18CJnkZ9XAm5ySE',
      'Ae2tdPwUPEZ3UJ2Y5zpbQeF8GEG1gtR1hoTdUoFJ5oHbbGkcinBrPJDhhhq',
      'Ae2tdPwUPEZ8ipN3wbA8heiZzuKzKRozK5SDzfuEjr8v38RRmFebaVN8ds6',
      'Ae2tdPwUPEZ1VJ4XrhmMMdyzKPmpEMcqajnt5HPCyAps5fF9aRFQCKYDCvj',
      'Ae2tdPwUPEZBr5uk5Rd1Ny2wVusVEqccTtsM5efBw6Sq1GdXiGzwAEDmjPP',
      'Ae2tdPwUPEYzX9Da4KhrarhhSaeFGB6bo8PByqmgj3TfJvr4jaouJ5Sns1N',
      'Ae2tdPwUPEZM6ok4jNYqLzU5Po2o68JdwNSspqai8axY4tJzYfQfj23M3vg',
      'Ae2tdPwUPEZ1WyLvNdf2wWPQgmACZ5ZgQBe6W8RYvNQsybYzQhAb5EFkwxQ',
    ]
    const used = [
      'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ7',
      'Ae2tdPwUPEZ8wGxWm9VbZXFJcgLeKQJWKqREVEtHXYdqsqc4bLeGqjSwrtu',
      'Ae2tdPwUPEZ6T9qZxpao8ciAgg6ahjHRq2jV45ndZ4oPXAwrTYqN9NGUPh4',
      'Ae2tdPwUPEYzFrD5QSQ8NPHEJ8reecZkch5tT8wFAAYu18CJnkZ9XAm5ySE',
      'Ae2tdPwUPEZ3UJ2Y5zpbQeF8GEG1gtR1hoTdUoFJ5oHbbGkcinBrPJDhhhq',
      'Ae2tdPwUPEZ8ipN3wbA8heiZzuKzKRozK5SDzfuEjr8v38RRmFebaVN8ds6',
      'Ae2tdPwUPEZ1VJ4XrhmMMdyzKPmpEMcqajnt5HPCyAps5fF9aRFQCKYDCvj',
    ]

    expect.assertions(1)
    const result = await api.filterUsedAddresses(addresses)
    expect(result).toEqual(used)
  })

  it('keeps order in filterUsedAddresses', async () => {
    const addresses = [
      'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ7',
      'Ae2tdPwUPEZ8wGxWm9VbZXFJcgLeKQJWKqREVEtHXYdqsqc4bLeGqjSwrtu',
      'Ae2tdPwUPEZ6T9qZxpao8ciAgg6ahjHRq2jV45ndZ4oPXAwrTYqN9NGUPh4',
      'Ae2tdPwUPEYzFrD5QSQ8NPHEJ8reecZkch5tT8wFAAYu18CJnkZ9XAm5ySE',
      'Ae2tdPwUPEZ3UJ2Y5zpbQeF8GEG1gtR1hoTdUoFJ5oHbbGkcinBrPJDhhhq',
      'Ae2tdPwUPEZ8ipN3wbA8heiZzuKzKRozK5SDzfuEjr8v38RRmFebaVN8ds6',
      'Ae2tdPwUPEZ1VJ4XrhmMMdyzKPmpEMcqajnt5HPCyAps5fF9aRFQCKYDCvj',
    ]

    expect.assertions(2)

    const result1 = await api.filterUsedAddresses(addresses)
    expect(result1).toEqual(addresses)

    addresses.reverse()

    const result2 = await api.filterUsedAddresses(addresses)
    expect(result2).toEqual(addresses)
  })
})
