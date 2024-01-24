import {fetchData} from '@yoroi/common'

import {claimApiMaker} from './api'

describe('claimApiMaker', () => {
  it('success', () => {
    const appApi = claimApiMaker({address: 'addr_test', primaryTokenId: 'primaryTokenId'})
    expect(appApi).toBeDefined()

    const appApiWithFetcher = claimApiMaker(
      {address: 'addr_test', primaryTokenId: 'primaryTokenId'},
      {request: fetchData},
    )
    expect(appApiWithFetcher).toBeDefined()
  })
})
