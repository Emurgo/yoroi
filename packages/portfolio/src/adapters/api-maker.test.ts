import {Chain, Portfolio} from '@yoroi/types'

import {apiConfig, portfolioApiMaker} from './api-maker'
import {AppApiRequestWithCache} from '../types'

describe('portfolioApiMaker', () => {
  const mockNetwork: Chain.Network = Chain.Network.Main
  const mockRequest = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should return a PortfolioApi object', () => {
    const api = portfolioApiMaker({
      network: mockNetwork,
      request: mockRequest,
    })

    expect(api).toBeDefined()
    expect(api).toHaveProperty('tokenDiscoveries')
    expect(api).toHaveProperty('tokenInfos')
  })

  it('should return a PortfolioApi object with default fetchData (coverage)', () => {
    const api = portfolioApiMaker({
      network: mockNetwork,
    })

    expect(api).toBeDefined()
    expect(api).toHaveProperty('tokenDiscoveries')
    expect(api).toHaveProperty('tokenInfos')
  })

  it('should call the fetchData function with the correct arguments', async () => {
    mockRequest.mockResolvedValue({})
    const api = portfolioApiMaker({
      network: mockNetwork,
      request: mockRequest,
    })
    const mockTokenIdsWithCache: ReadonlyArray<
      AppApiRequestWithCache<Portfolio.Token.Id>
    > = [['token.id', 'etag-hash']]

    await api.tokenDiscoveries(mockTokenIdsWithCache)
    await api.tokenInfos(mockTokenIdsWithCache)

    expect(mockRequest).toHaveBeenCalledTimes(2)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: apiConfig[Chain.Network.Main].tokenDiscoveries,
      data: mockTokenIdsWithCache,
    })
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: apiConfig[Chain.Network.Main].tokenInfos,
      data: mockTokenIdsWithCache,
    })
  })
})
