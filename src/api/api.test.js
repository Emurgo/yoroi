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
    expect(result[0]).toMatchSnapshot({best_block_num: expect.any(String)})
  })

  it('throws ApiError on bad request', async () => {

    const addresses = []
    const ts = 'not-a-date'

    // We are async
    expect.assertions(1)

    await expect(
      api.fetchNewTxHistory(ts, addresses)
    ).rejects.toThrow(ApiError)
  })
})
