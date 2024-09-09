import {fetchData} from '@yoroi/common'
import {tokenInfoMocks, tokenMocks} from '@yoroi/portfolio'
import {Api, Portfolio, Scan} from '@yoroi/types'

import {claimManagerMaker} from './manager'
import {claimFaucetResponses} from './api-faucet.mocks'
import {claimApiMockResponses} from './manager.mocks'

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

describe('claimManagerMaker - postClaimTokens', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const tokenManagerMock = {
    sync: jest.fn(),
    api: {
      tokenActivity: jest.fn(),
      tokenDiscovery: jest.fn(),
      tokenImageInvalidate: jest.fn(),
      tokenInfo: jest.fn(),
      tokenInfos: jest.fn(),
      tokenTraits: jest.fn(),
    },
    clear: jest.fn(),
    destroy: jest.fn(),
    hydrate: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    observable$: {} as any,
  }

  tokenManagerMock.sync.mockResolvedValue(
    new Map([
      [
        tokenMocks.nftCryptoKitty.info.id,
        {record: tokenMocks.nftCryptoKitty.info},
      ],
      [tokenMocks.rnftWhatever.info.id, {record: tokenMocks.rnftWhatever.info}],
    ]),
  )

  const options = {
    address: 'addr_test',
    primaryTokenInfo: tokenInfoMocks.primaryETH,
    tokenManager: tokenManagerMock,
  }

  const claimAction: Scan.ActionClaim = {
    action: 'claim',
    code: 'claim_code',
    params: {someParam: 'value'},
    url: 'https://api.example.com/claim',
  }

  it('should handle successful claim', async () => {
    const mockResponse = {
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: claimFaucetResponses.claimTokens.success.accepted,
      },
    }

    const request = jest.fn().mockResolvedValue(mockResponse)

    const manager = claimManagerMaker(options, {request})
    const result = await manager.claimTokens(claimAction)

    expect(result).toEqual(claimApiMockResponses.claimTokens.accepted)
  })

  it('should throw API when not specific to claim', async () => {
    const errorApiResponse: Api.ResponseError = {
      status: Api.HttpStatusCode.Unauthorized,
      message: 'Unauthorized',
      responseData: null,
    }
    const mockErrorResponse = {
      tag: 'left',
      error: errorApiResponse,
    }

    const request = jest.fn().mockResolvedValue(mockErrorResponse)

    const manager = claimManagerMaker(options, {request})

    await expect(() => manager.claimTokens(claimAction)).rejects.toThrow(
      Api.Errors.Unauthorized,
    )
  })

  it('should handle malformed API response', async () => {
    const malformedResponse = {
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: {something: 'else'},
      },
    }

    const request = jest.fn().mockResolvedValue(malformedResponse)

    const manager = claimManagerMaker(options, {request})

    await expect(manager.claimTokens(claimAction)).rejects.toThrow(
      Api.Errors.ResponseMalformed,
    )
  })

  it('should handle unknown errors', async () => {
    const request = async () => {
      throw new Api.Errors.Forbidden()
    }

    const manager = claimManagerMaker(options, {request})

    await expect(manager.claimTokens(claimAction)).rejects.toThrow(
      Api.Errors.Forbidden,
    )
  })
})
