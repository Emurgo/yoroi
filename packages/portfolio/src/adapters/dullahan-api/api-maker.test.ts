import {Api, Chain, Portfolio} from '@yoroi/types'

import {apiConfig, portfolioApiMaker} from './api-maker'
import {DullahanApiCachedIdsRequest} from './types'

describe('portfolioApiMaker', () => {
  const mockNetwork: Chain.Network = Chain.Network.Mainnet
  const mockRequest = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should return a PortfolioApi object', () => {
    const api = portfolioApiMaker({
      network: mockNetwork,
      request: mockRequest,
    })

    expect(Object.isFrozen(api)).toBe(true)
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
    mockRequest.mockResolvedValue({
      tag: 'right',
      value: {
        status: 200,
        data: {},
      },
    })
    const api = portfolioApiMaker({
      network: mockNetwork,
      request: mockRequest,
    })
    const mockTokenIdsWithCache: ReadonlyArray<
      Api.RequestWithCache<Portfolio.Token.Id>
    > = [['token.id', 'etag-hash']]
    const mockTokenIdsWithCacheRequest: DullahanApiCachedIdsRequest = [
      'token.id:etag-hash',
    ]

    await api.tokenDiscoveries(mockTokenIdsWithCache)
    await api.tokenInfos(mockTokenIdsWithCache)

    expect(mockRequest).toHaveBeenCalledTimes(2)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: apiConfig[Chain.Network.Mainnet].tokenDiscoveries,
      data: mockTokenIdsWithCacheRequest,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: apiConfig[Chain.Network.Mainnet].tokenInfos,
      data: mockTokenIdsWithCacheRequest,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
  })

  it('should return error when returning data is malformed', async () => {
    mockRequest.mockResolvedValue({
      tag: 'right',
      value: {
        status: 200,
        data: {
          ['wrong']: 'data',
        },
      },
    })
    const api = portfolioApiMaker({
      network: mockNetwork,
      request: mockRequest,
    })
    const mockTokenIdsWithCache: ReadonlyArray<
      Api.RequestWithCache<Portfolio.Token.Id>
    > = [['token.id', 'etag-hash']]
    const mockTokenIdsWithCacheRequest: DullahanApiCachedIdsRequest = [
      'token.id:etag-hash',
    ]

    await api.tokenDiscoveries(mockTokenIdsWithCache)
    const result = await api.tokenInfos(mockTokenIdsWithCache)

    expect(mockRequest).toHaveBeenCalledTimes(2)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: apiConfig[Chain.Network.Mainnet].tokenDiscoveries,
      data: mockTokenIdsWithCacheRequest,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: apiConfig[Chain.Network.Mainnet].tokenInfos,
      data: mockTokenIdsWithCacheRequest,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    expect(result).toEqual({
      tag: 'left',
      error: {
        status: -3,
        message: 'Failed to transform token infos response',
        responseData: {
          ['wrong']: 'data',
        },
      },
    })
  })

  it('should return the error and not throw', async () => {
    mockRequest.mockResolvedValue({
      tag: 'left',
      value: {
        status: 500,
        message: 'Internal Server Error',
        responseData: {},
      },
    })
    const api = portfolioApiMaker({
      network: mockNetwork,
      request: mockRequest,
    })
    const mockTokenIdsWithCache: ReadonlyArray<
      Api.RequestWithCache<Portfolio.Token.Id>
    > = [['token.id', 'etag-hash']]
    const mockTokenIdsWithCacheRequest: DullahanApiCachedIdsRequest = [
      'token.id:etag-hash',
    ]

    await api.tokenDiscoveries(mockTokenIdsWithCache)
    await api.tokenInfos(mockTokenIdsWithCache)

    expect(mockRequest).toHaveBeenCalledTimes(2)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: apiConfig[Chain.Network.Mainnet].tokenDiscoveries,
      data: mockTokenIdsWithCacheRequest,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: apiConfig[Chain.Network.Mainnet].tokenInfos,
      data: mockTokenIdsWithCacheRequest,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
  })
})
