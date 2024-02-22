import {Chain} from '@yoroi/types'

import {portfolioManagerMaker} from './manager'
import {portfolioApiMock} from './adapters/api-maker.mocks'

describe('portfolioManagerMaker', () => {
  it('should be instantiated', () => {
    const portfolioManager = portfolioManagerMaker({
      network: Chain.Network.Main,
      api: portfolioApiMock.success,
      storage: {} as any,
    })

    expect(portfolioManager).toBeDefined()
  })
})
