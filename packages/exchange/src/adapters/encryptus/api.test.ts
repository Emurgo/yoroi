import {Api, Exchange, Left, Right} from '@yoroi/types'
import {
  EncryptusApiResponse,
  encryptusApiConfig,
  encryptusApiGetBaseUrl,
} from './api'
import {getEncryptusBaseUrlResponse} from './api.mocks'

describe('getEncryptusBaseUrl', () => {
  it('should return the link - sandbox', async () => {
    const isProduction = false
    const expectedUrl = encryptusApiConfig.sandbox.getBaseUrl
    const mockFetchDataResponse: Right<
      Api.ResponseSuccess<EncryptusApiResponse>
    > = {
      tag: 'right',
      value: {
        data: getEncryptusBaseUrlResponse,
        status: 200,
      },
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getBaseUrl = encryptusApiGetBaseUrl({request: mockFetchData})

    const result = await getBaseUrl({isProduction})

    expect(mockFetchData).toHaveBeenCalledWith(
      {
        url: expectedUrl,
      },
      undefined,
    )
    expect(result).toBe(getEncryptusBaseUrlResponse.data.link)
  })

  it('should return the link - production', async () => {
    const isProduction = true
    const expectedUrl = encryptusApiConfig.production.getBaseUrl
    const mockFetchDataResponse: Right<
      Api.ResponseSuccess<EncryptusApiResponse>
    > = {
      tag: 'right',
      value: {
        data: getEncryptusBaseUrlResponse,
        status: 200,
      },
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getBaseUrl = encryptusApiGetBaseUrl({request: mockFetchData})

    const result = await getBaseUrl({isProduction})

    expect(mockFetchData).toHaveBeenCalledWith(
      {
        url: expectedUrl,
      },
      undefined,
    )
    expect(result).toBe(getEncryptusBaseUrlResponse.data.link)
  })

  it('should throw invalid response if the response doesnt contain the link', async () => {
    const isProduction = false
    const expectedUrl = encryptusApiConfig.sandbox.getBaseUrl
    const invalidApiResponse = {...getEncryptusBaseUrlResponse, data: {}}

    const mockFetchDataResponse: Right<
      Api.ResponseSuccess<EncryptusApiResponse>
    > = {
      tag: 'right',
      value: {
        data: invalidApiResponse as any,
        status: 200,
      },
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getBaseUrl = encryptusApiGetBaseUrl({request: mockFetchData})

    await expect(() => getBaseUrl({isProduction})).rejects.toThrow(
      Exchange.Errors.Validation,
    )
    expect(mockFetchData).toHaveBeenCalledWith(
      {
        url: expectedUrl,
      },
      undefined,
    )
  })

  it('should throw unknow error if throws an error', async () => {
    const isProduction = false
    const expectedUrl = encryptusApiConfig.sandbox.getBaseUrl

    const errorApiResponse: Api.ResponseError = {
      status: 404,
      message: 'Mega Bad Error',
      responseData: null,
    }

    const mockFetchDataResponse: Left<Api.ResponseError> = {
      tag: 'left',
      error: errorApiResponse,
    }

    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getBaseUrl = encryptusApiGetBaseUrl({request: mockFetchData})

    await expect(() => getBaseUrl({isProduction})).rejects.toThrow(
      Exchange.Errors.Unknown,
    )

    expect(mockFetchData).toHaveBeenCalledWith(
      {
        url: expectedUrl,
      },
      undefined,
    )
  })

  it('should build without dependencies (coverage only)', () => {
    const getCryptoAddress = encryptusApiGetBaseUrl()
    expect(getCryptoAddress).toBeDefined()
  })
})
