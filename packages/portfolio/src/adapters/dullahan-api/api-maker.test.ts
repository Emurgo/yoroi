import {Api, Chain, Portfolio} from '@yoroi/types'

import {apiConfig, portfolioApiMaker} from './api-maker'
import {DullahanApiCachedIdsRequest} from './types'
import {tokenDiscoveryMocks} from '../token-discovery.mocks'
import {tokenMocks} from '../token.mocks'
import {tokenActivityMocks} from '../token-activity.mocks'
import {tokenImageInvalidateMocks} from '../token-image-invalidate.mocks'
import {tokenHistoryMocks} from '../token-history.mocks'

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
      maxIdsPerRequest: 10,
      maxConcurrentRequests: 10,
    })

    expect(Object.isFrozen(api)).toBe(true)
    expect(api).toBeDefined()
    expect(api).toHaveProperty('tokenDiscovery')
    expect(api).toHaveProperty('tokenInfos')
    expect(api).toHaveProperty('tokenTraits')
    expect(api).toHaveProperty('tokenActivity')
    expect(api).toHaveProperty('tokenHistory')
    expect(api).toHaveProperty('tokenImageInvalidate')
  })

  it('should return a PortfolioApi object with default fetchData (coverage)', () => {
    const api = portfolioApiMaker({
      network: mockNetwork,
      maxIdsPerRequest: 10,
      maxConcurrentRequests: 10,
    })

    expect(api).toBeDefined()
    expect(api).toHaveProperty('tokenDiscovery')
    expect(api).toHaveProperty('tokenInfos')
    expect(api).toHaveProperty('tokenTraits')
    expect(api).toHaveProperty('tokenActivity')
    expect(api).toHaveProperty('tokenHistory')
    expect(api).toHaveProperty('tokenImageInvalidate')
  })

  it('should call the fetchData function with the correct arguments', async () => {
    mockRequest.mockResolvedValue({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: {},
      },
    })
    const api = portfolioApiMaker({
      network: mockNetwork,
      request: mockRequest,
      maxIdsPerRequest: 10,
      maxConcurrentRequests: 10,
    })
    const mockTokenIdsWithCache: ReadonlyArray<
      Api.RequestWithCache<Portfolio.Token.Id>
    > = [['token.id', 'etag-hash']]
    const mockTokenIdsWithCacheRequest: DullahanApiCachedIdsRequest = [
      'token.id:etag-hash',
    ]

    await api.tokenDiscovery(tokenDiscoveryMocks.nftCryptoKitty.id)
    await api.tokenInfos(mockTokenIdsWithCache)
    await api.tokenTraits(tokenMocks.nftCryptoKitty.info.id)
    await api.tokenInfo(tokenMocks.nftCryptoKitty.info.id)
    await api.tokenActivity(
      tokenActivityMocks.api.request,
      Portfolio.Token.ActivityWindow.OneDay,
    )
    await api.tokenHistory(
      tokenHistoryMocks.api.request.tokenId,
      tokenHistoryMocks.api.request.period,
    )

    expect(mockRequest).toHaveBeenCalledTimes(6)

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'get',
      url:
        apiConfig[Chain.Network.Mainnet].tokenDiscovery +
        '/' +
        tokenDiscoveryMocks.nftCryptoKitty.id,
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
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'get',
      url:
        apiConfig[Chain.Network.Mainnet].tokenTraits +
        '/' +
        tokenMocks.nftCryptoKitty.info.id,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'get',
      url:
        apiConfig[Chain.Network.Mainnet].tokenInfo +
        '/' +
        tokenMocks.nftCryptoKitty.info.id,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: `${apiConfig[Chain.Network.Mainnet].tokenActivity}/${
        Portfolio.Token.ActivityWindow.OneDay
      }`,
      data: tokenActivityMocks.api.request,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: apiConfig[Chain.Network.Mainnet].tokenHistory,
      data: tokenHistoryMocks.api.request,
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
        status: Api.HttpStatusCode.Ok,
        data: {
          ['wrong']: [200, 'data'],
        },
      },
    })
    const api = portfolioApiMaker({
      network: mockNetwork,
      request: mockRequest,
      maxIdsPerRequest: 10,
      maxConcurrentRequests: 10,
    })
    const mockTokenIdsWithCache: ReadonlyArray<
      Api.RequestWithCache<Portfolio.Token.Id>
    > = [['token.id', 'etag-hash']]
    const mockTokenIdsWithCacheRequest: DullahanApiCachedIdsRequest = [
      'token.id:etag-hash',
    ]

    const resultDiscovery = await api.tokenDiscovery(
      tokenDiscoveryMocks.nftCryptoKitty.id,
    )
    expect(mockRequest).toHaveBeenCalledTimes(1)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'get',
      url:
        apiConfig[Chain.Network.Mainnet].tokenDiscovery +
        '/' +
        tokenDiscoveryMocks.nftCryptoKitty.id,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    expect(resultDiscovery).toEqual({
      tag: 'left',
      error: {
        status: -3,
        message: 'Failed to transform token discovery response',
        responseData: {
          ['wrong']: [200, 'data'],
        },
      },
    })

    const resultTokenInfos = await api.tokenInfos(mockTokenIdsWithCache)
    expect(mockRequest).toHaveBeenCalledTimes(2)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: apiConfig[Chain.Network.Mainnet].tokenInfos,
      data: mockTokenIdsWithCacheRequest,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    expect(resultTokenInfos).toEqual({
      tag: 'left',
      error: {
        status: -3,
        message: 'Failed to transform token infos response',
        responseData: {
          ['wrong']: [200, 'data'],
        },
      },
    })

    const resultTraits = await api.tokenTraits(
      tokenMocks.nftCryptoKitty.info.id,
    )
    expect(mockRequest).toHaveBeenCalledTimes(3)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'get',
      url:
        apiConfig[Chain.Network.Mainnet].tokenTraits +
        '/' +
        tokenMocks.nftCryptoKitty.info.id,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    expect(resultTraits).toEqual({
      tag: 'left',
      error: {
        status: -3,
        message: 'Failed to transform token traits response',
        responseData: {
          ['wrong']: [200, 'data'],
        },
      },
    })

    const resultInfo = await api.tokenInfo(tokenMocks.nftCryptoKitty.info.id)
    expect(mockRequest).toHaveBeenCalledTimes(4)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'get',
      url:
        apiConfig[Chain.Network.Mainnet].tokenInfo +
        '/' +
        tokenMocks.nftCryptoKitty.info.id,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    expect(resultInfo).toEqual({
      tag: 'left',
      error: {
        status: -3,
        message: 'Failed to transform token info response',
        responseData: {
          ['wrong']: [200, 'data'],
        },
      },
    })

    const resultTokenActivity = await api.tokenActivity(
      tokenActivityMocks.api.request,
      Portfolio.Token.ActivityWindow.OneDay,
    )
    expect(mockRequest).toHaveBeenCalledTimes(5)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: `${apiConfig[Chain.Network.Mainnet].tokenActivity}/${
        Portfolio.Token.ActivityWindow.OneDay
      }`,
      data: tokenActivityMocks.api.request,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    expect(resultTokenActivity).toEqual({
      tag: 'left',
      error: {
        status: -3,
        message: 'Failed to transform token activity updates response',
        responseData: {
          ['wrong']: [200, 'data'],
        },
      },
    })

    const resultTokenHistory = await api.tokenHistory(
      tokenHistoryMocks.api.request.tokenId,
      tokenHistoryMocks.api.request.period,
    )
    expect(mockRequest).toHaveBeenCalledTimes(6)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: apiConfig[Chain.Network.Mainnet].tokenHistory,
      data: tokenHistoryMocks.api.request,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    expect(resultTokenHistory).toEqual({
      tag: 'left',
      error: {
        status: -3,
        message: 'Failed to transform token history response',
        responseData: {
          ['wrong']: [200, 'data'],
        },
      },
    })
  })

  it('should return the error and not throw', async () => {
    mockRequest.mockResolvedValue({
      tag: 'left',
      value: {
        status: Api.HttpStatusCode.InternalServerError,
        message: 'Internal Server Error',
        responseData: {},
      },
    })
    const api = portfolioApiMaker({
      network: mockNetwork,
      request: mockRequest,
      maxIdsPerRequest: 10,
      maxConcurrentRequests: 10,
    })
    const mockTokenIdsWithCache: ReadonlyArray<
      Api.RequestWithCache<Portfolio.Token.Id>
    > = [['token.id', 'etag-hash']]
    const mockTokenIdsWithCacheRequest: DullahanApiCachedIdsRequest = [
      'token.id:etag-hash',
    ]

    await expect(api.tokenInfos(mockTokenIdsWithCache)).resolves.toEqual({
      tag: 'left',
      value: {
        status: Api.HttpStatusCode.InternalServerError,
        message: 'Internal Server Error',
        responseData: {},
      },
    })
    expect(mockRequest).toHaveBeenCalledTimes(1)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: apiConfig[Chain.Network.Mainnet].tokenInfos,
      data: mockTokenIdsWithCacheRequest,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    await expect(
      api.tokenDiscovery(tokenDiscoveryMocks.nftCryptoKitty.id),
    ).resolves.toEqual({
      tag: 'left',
      value: {
        status: Api.HttpStatusCode.InternalServerError,
        message: 'Internal Server Error',
        responseData: {},
      },
    })
    expect(mockRequest).toHaveBeenCalledTimes(2)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'get',
      url:
        apiConfig[Chain.Network.Mainnet].tokenDiscovery +
        '/' +
        tokenDiscoveryMocks.nftCryptoKitty.id,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    await expect(
      api.tokenTraits(tokenMocks.nftCryptoKitty.info.id),
    ).resolves.toEqual({
      tag: 'left',
      value: {
        status: Api.HttpStatusCode.InternalServerError,
        message: 'Internal Server Error',
        responseData: {},
      },
    })
    expect(mockRequest).toHaveBeenCalledTimes(3)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'get',
      url:
        apiConfig[Chain.Network.Mainnet].tokenTraits +
        '/' +
        tokenMocks.nftCryptoKitty.info.id,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    await expect(
      api.tokenInfo(tokenMocks.nftCryptoKitty.info.id),
    ).resolves.toEqual({
      tag: 'left',
      value: {
        status: Api.HttpStatusCode.InternalServerError,
        message: 'Internal Server Error',
        responseData: {},
      },
    })
    expect(mockRequest).toHaveBeenCalledTimes(4)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'get',
      url:
        apiConfig[Chain.Network.Mainnet].tokenInfo +
        '/' +
        tokenMocks.nftCryptoKitty.info.id,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    await expect(
      api.tokenActivity(
        tokenActivityMocks.api.request,
        Portfolio.Token.ActivityWindow.OneDay,
      ),
    ).resolves.toEqual({
      tag: 'left',
      value: {
        status: Api.HttpStatusCode.InternalServerError,
        message: 'Internal Server Error',
        responseData: {},
      },
    })
    expect(mockRequest).toHaveBeenCalledTimes(5)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: `${apiConfig[Chain.Network.Mainnet].tokenActivity}/${
        Portfolio.Token.ActivityWindow.OneDay
      }`,
      data: tokenActivityMocks.api.request,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    await expect(
      api.tokenHistory(
        tokenHistoryMocks.api.request.tokenId,
        tokenHistoryMocks.api.request.period,
      ),
    ).resolves.toEqual({
      tag: 'left',
      value: {
        status: Api.HttpStatusCode.InternalServerError,
        message: 'Internal Server Error',
        responseData: {},
      },
    })
    expect(mockRequest).toHaveBeenCalledTimes(6)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: apiConfig[Chain.Network.Mainnet].tokenHistory,
      data: tokenHistoryMocks.api.request,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
  })

  it('should return the data on success (traits)', async () => {
    mockRequest.mockResolvedValue({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: tokenMocks.nftCryptoKitty.traits,
      },
    })
    const api = portfolioApiMaker({
      network: mockNetwork,
      request: mockRequest,
      maxIdsPerRequest: 10,
      maxConcurrentRequests: 10,
    })

    const result = await api.tokenTraits(tokenMocks.nftCryptoKitty.info.id)
    expect(mockRequest).toHaveBeenCalledTimes(1)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'get',
      url:
        apiConfig[Chain.Network.Mainnet].tokenTraits +
        '/' +
        tokenMocks.nftCryptoKitty.info.id,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    expect(result).toEqual({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: tokenMocks.nftCryptoKitty.traits,
      },
    })
  })

  it('should return the data on success (tokenInfo)', async () => {
    mockRequest.mockResolvedValue({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: tokenMocks.nftCryptoKitty.info,
      },
    })
    const api = portfolioApiMaker({
      network: mockNetwork,
      request: mockRequest,
      maxIdsPerRequest: 10,
      maxConcurrentRequests: 10,
    })

    const result = await api.tokenInfo(tokenMocks.nftCryptoKitty.info.id)
    expect(mockRequest).toHaveBeenCalledTimes(1)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'get',
      url:
        apiConfig[Chain.Network.Mainnet].tokenInfo +
        '/' +
        tokenMocks.nftCryptoKitty.info.id,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    expect(result).toEqual({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: tokenMocks.nftCryptoKitty.info,
      },
    })
  })

  it('should return the data on success (tokenActivity)', async () => {
    mockRequest.mockResolvedValue(tokenActivityMocks.api.responses.success)

    const api = portfolioApiMaker({
      network: mockNetwork,
      request: mockRequest,
      maxIdsPerRequest: 10,
      maxConcurrentRequests: 10,
    })

    const result = await api.tokenActivity(
      tokenActivityMocks.api.request,
      Portfolio.Token.ActivityWindow.OneDay,
    )

    expect(mockRequest).toHaveBeenCalledTimes(1)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: `${apiConfig[Chain.Network.Mainnet].tokenActivity}/${
        Portfolio.Token.ActivityWindow.OneDay
      }`,
      data: tokenActivityMocks.api.request,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    expect(result).toEqual({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: tokenActivityMocks.api.responseDataOnly,
      },
    })
  })

  it('should return the data on success (tokenHistory)', async () => {
    mockRequest.mockResolvedValue(tokenHistoryMocks.api.responses.success)

    const api = portfolioApiMaker({
      network: mockNetwork,
      request: mockRequest,
      maxIdsPerRequest: 10,
      maxConcurrentRequests: 10,
    })

    const result = await api.tokenHistory(
      tokenHistoryMocks.api.request.tokenId,
      tokenHistoryMocks.api.request.period,
    )

    expect(mockRequest).toHaveBeenCalledTimes(1)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: apiConfig[Chain.Network.Mainnet].tokenHistory,
      data: tokenHistoryMocks.api.request,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    expect(result).toEqual({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: tokenHistoryMocks.api.responseDataOnly,
      },
    })
  })

  it('should return error when returning data is malformed token-discovery', async () => {
    mockRequest.mockResolvedValue({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: 0,
      },
    })
    const api = portfolioApiMaker({
      network: mockNetwork,
      request: mockRequest,
      maxIdsPerRequest: 10,
      maxConcurrentRequests: 10,
    })

    const wrong = await api.tokenDiscovery(
      tokenDiscoveryMocks.nftCryptoKitty.id,
    )

    expect(mockRequest).toHaveBeenCalledTimes(1)
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'get',
      url:
        apiConfig[Chain.Network.Mainnet].tokenDiscovery +
        '/' +
        tokenDiscoveryMocks.nftCryptoKitty.id,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    expect(wrong).toEqual({
      tag: 'left',
      error: {
        status: -3,
        message: 'Failed to transform token discovery response',
        responseData: 0,
      },
    })

    mockRequest.mockResolvedValue({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: {
          ...tokenDiscoveryMocks.nftCryptoKitty,
          supply: undefined,
        },
      },
    })

    const missing = await api.tokenDiscovery(
      tokenDiscoveryMocks.nftCryptoKitty.id,
    )

    expect(missing).toEqual({
      tag: 'left',
      error: {
        status: -3,
        message: 'Failed to transform token discovery response',
        responseData: {
          ...tokenDiscoveryMocks.nftCryptoKitty,
          supply: undefined,
        },
      },
    })
    expect(mockRequest).toHaveBeenCalledTimes(2)

    mockRequest.mockResolvedValue({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: tokenDiscoveryMocks.nftCryptoKitty,
      },
    })

    const right = await api.tokenDiscovery(
      tokenDiscoveryMocks.nftCryptoKitty.id,
    )
    expect(right).toEqual({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: tokenDiscoveryMocks.nftCryptoKitty,
      },
    })
  })

  it('should return nothing when invalidating image', async () => {
    mockRequest.mockResolvedValue({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: {},
      },
    })
    const api = portfolioApiMaker({
      network: mockNetwork,
      request: mockRequest,
      maxIdsPerRequest: 10,
      maxConcurrentRequests: 10,
    })

    await api.tokenImageInvalidate(tokenImageInvalidateMocks.api.request)

    expect(mockRequest).toHaveBeenCalledTimes(1)
  })
})
