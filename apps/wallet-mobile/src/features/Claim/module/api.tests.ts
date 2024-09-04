import {fetchData} from '@yoroi/common'
import {tokenInfoMocks} from '@yoroi/portfolio'
import {Portfolio} from '@yoroi/types'

import {claimApiMaker} from './api'

describe('claimApiMaker', () => {
  const options = {
    address: 'addr_test',
    primaryTokenInfo: tokenInfoMocks.primaryETH,
    tokenManager: {} as Portfolio.Manager.Token,
  }

  it('success', () => {
    const appApi = claimApiMaker(options)
    expect(appApi).toBeDefined()

    const appApiWithFetcher = claimApiMaker(options, {request: fetchData})
    expect(appApiWithFetcher).toBeDefined()
  })
})
