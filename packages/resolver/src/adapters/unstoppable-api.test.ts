import {Api, Left, Right} from '@yoroi/types'

import {
  UnstoppableApiGetCryptoAddressResponse,
  UnstoppableApiErrorInvalidDomain,
  UnstoppableApiErrorInvalidResponse,
  UnstoppableApiErrorNotFound,
  unstoppableApiConfig,
  unstoppableApiGetCryptoAddress,
} from './unstoppable-api'
import {handleApiMockResponses} from './unstoppable-api.mocks'

describe('getCryptoAddress', () => {
  const mockAddress =
    handleApiMockResponses.getCrypoAddress.records['crypto.ADA.address']
  const mockApiResponse = handleApiMockResponses.getCrypoAddress
  const mockOptions = {
    apiKey: 'mock-api-key',
  }

  it('should return the address', async () => {
    const domain = mockApiResponse.meta.domain
    const expectedUrl = `${unstoppableApiConfig.mainnet.getCryptoAddress}${domain}`

    const mockFetchDataResponse: Right<UnstoppableApiGetCryptoAddressResponse> =
      {
        tag: 'right',
        value: mockApiResponse,
      }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getCryptoAddress = unstoppableApiGetCryptoAddress(mockOptions, {
      request: mockFetchData,
    })

    const result = await getCryptoAddress(domain)

    expect(mockFetchData).toHaveBeenCalledWith({
      headers: {
        'Content-Type': 'application/json',
        'Bearer': mockOptions.apiKey,
      },
      url: expectedUrl,
    })
    expect(result).toBe(mockAddress)
  })

  it('should throw invalid domain if the domain provided is not a valid unstoppable domain (doesnt have . or unsupported TLD)', async () => {
    const domain = 'not-a-valid-domain'
    const expectedUrl = `${unstoppableApiConfig.mainnet.getCryptoAddress}${domain}`

    const mockFetchDataResponse: Right<UnstoppableApiGetCryptoAddressResponse> =
      {
        tag: 'right',
        value: mockApiResponse,
      }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getCryptoAddress = unstoppableApiGetCryptoAddress(mockOptions, {
      request: mockFetchData,
    })

    await expect(() => getCryptoAddress(domain)).rejects.toThrow(
      UnstoppableApiErrorInvalidDomain,
    )
    expect(mockFetchData).not.toHaveBeenCalledWith({
      headers: {
        'Content-Type': 'application/json',
        'Bearer': mockOptions.apiKey,
      },
      url: expectedUrl,
    })
  })

  it('should throw invalid response if the response doesnt contain the address for ada', async () => {
    const domain = mockApiResponse.meta.domain
    const expectedUrl = `${unstoppableApiConfig.mainnet.getCryptoAddress}${domain}`
    const invalidApiResponse = {
      ...mockApiResponse,
      records: {'crypto.ADA.address': 123},
    }

    const mockFetchDataResponse: Right<UnstoppableApiGetCryptoAddressResponse> =
      {
        tag: 'right',
        value: invalidApiResponse as any,
      }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getCryptoAddress = unstoppableApiGetCryptoAddress(mockOptions, {
      request: mockFetchData,
    })

    await expect(() => getCryptoAddress(domain)).rejects.toThrow(
      UnstoppableApiErrorInvalidResponse,
    )
    expect(mockFetchData).toHaveBeenCalledWith({
      headers: {
        'Content-Type': 'application/json',
        'Bearer': mockOptions.apiKey,
      },
      url: expectedUrl,
    })
  })

  it('should throw not found if the response doesnt contain the address for ada', async () => {
    const domain = mockApiResponse.meta.domain
    const expectedUrl = `${unstoppableApiConfig.mainnet.getCryptoAddress}${domain}`
    const invalidApiResponse = {
      ...mockApiResponse,
      records: {},
    }

    const mockFetchDataResponse: Right<UnstoppableApiGetCryptoAddressResponse> =
      {
        tag: 'right',
        value: invalidApiResponse as any,
      }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getCryptoAddress = unstoppableApiGetCryptoAddress(mockOptions, {
      request: mockFetchData,
    })

    await expect(() => getCryptoAddress(domain)).rejects.toThrow(
      UnstoppableApiErrorNotFound,
    )
    expect(mockFetchData).toHaveBeenCalledWith({
      headers: {
        'Content-Type': 'application/json',
        'Bearer': mockOptions.apiKey,
      },
      url: expectedUrl,
    })
  })

  it('should throw not found if the ada handle doesnt have an owner yet', async () => {
    const domain = mockApiResponse.meta.domain
    const expectedUrl = `${unstoppableApiConfig.mainnet.getCryptoAddress}${domain}`
    const errorApiResponse: Api.ResponseError = {
      status: 404,
      message: 'Not found',
    }

    const mockFetchDataResponse: Left<Api.ResponseError> = {
      tag: 'left',
      error: errorApiResponse,
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getCryptoAddress = unstoppableApiGetCryptoAddress(mockOptions, {
      request: mockFetchData,
    })

    await expect(() => getCryptoAddress(domain)).rejects.toThrow(
      UnstoppableApiErrorNotFound,
    )
    expect(mockFetchData).toHaveBeenCalledWith({
      headers: {
        'Content-Type': 'application/json',
        'Bearer': mockOptions.apiKey,
      },
      url: expectedUrl,
    })
  })

  it('should rethrow the api error if hasnt a map to a handle error', async () => {
    const domain = mockApiResponse.meta.domain
    const expectedUrl = `${unstoppableApiConfig.mainnet.getCryptoAddress}${domain}`
    const errorApiResponse: Api.ResponseError = {
      status: 425,
      message: 'Too Early',
    }

    const mockFetchDataResponse: Left<Api.ResponseError> = {
      tag: 'left',
      error: errorApiResponse,
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getCryptoAddress = unstoppableApiGetCryptoAddress(mockOptions, {
      request: mockFetchData,
    })

    await expect(() => getCryptoAddress(domain)).rejects.toThrow(
      Api.Errors.TooEarly,
    )
    expect(mockFetchData).toHaveBeenCalledWith({
      headers: {
        'Content-Type': 'application/json',
        'Bearer': mockOptions.apiKey,
      },
      url: expectedUrl,
    })
  })

  it('should build without dependencies (coverage only)', () => {
    const getCryptoAddress = unstoppableApiGetCryptoAddress(mockOptions)
    expect(getCryptoAddress).toBeDefined()
  })
})
