import {fetchData} from '@yoroi/common'
import {tokenInfoMocks} from '@yoroi/portfolio'
import {Portfolio} from '@yoroi/types'

import {claimManagerMaker} from './manager'

describe('claimManagerMaker', () => {
  const options = {
    address: 'addr_test',
    primaryTokenInfo: tokenInfoMocks.primaryETH,
    tokenManager: {} as Portfolio.Manager.Token,
  }

  it('success', () => {
    const manager = claimManagerMaker(options)
    expect(manager).toBeDefined()

    const managerWithFetcher = claimManagerMaker(options, {request: fetchData})
    expect(managerWithFetcher).toBeDefined()
  })
})
