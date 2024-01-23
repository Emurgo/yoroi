import {Api, Left, Resolver, Right} from '@yoroi/types'

import {
  UnstoppableApiGetCryptoAddressResponse,
  unstoppableApiConfig,
  unstoppableApiGetCryptoAddress,
} from './api'
import {handleApiMockResponses} from './api.mocks'

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

    const mockFetchDataResponse: Right<
      Api.ResponseSuccess<UnstoppableApiGetCryptoAddressResponse>
    > = {
      tag: 'right',
      value: {
        data: mockApiResponse,
        status: 200,
      },
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getCryptoAddress = unstoppableApiGetCryptoAddress(mockOptions, {
      request: mockFetchData,
    })

    const result = await getCryptoAddress(domain)

    expect(mockFetchData).toHaveBeenCalledWith(
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockOptions.apiKey}`,
        },
        url: expectedUrl,
      },
      undefined,
    )
    expect(result).toBe(mockAddress)
  })

  it('should throw invalid domain if the domain provided is not a valid unstoppable domain (doesnt contain .)', async () => {
    const domain = 'not-a-valid-domain'
    const expectedUrl = `${unstoppableApiConfig.mainnet.getCryptoAddress}${domain}`

    const mockFetchDataResponse: Right<
      Api.ResponseSuccess<UnstoppableApiGetCryptoAddressResponse>
    > = {
      tag: 'right',
      value: {
        data: mockApiResponse,
        status: 200,
      },
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getCryptoAddress = unstoppableApiGetCryptoAddress(mockOptions, {
      request: mockFetchData,
    })

    await expect(() => getCryptoAddress(domain)).rejects.toThrow(
      Resolver.Errors.InvalidDomain,
    )
    expect(mockFetchData).not.toHaveBeenCalledWith(
      {
        headers: {
          'Content-Type': 'application/json',
          'Bearer': mockOptions.apiKey,
        },
        url: expectedUrl,
      },
      undefined,
    )
  })

  it('should throw unsupported tlds', async () => {
    const domain = 'ud.what'
    const expectedUrl = `${unstoppableApiConfig.mainnet.getCryptoAddress}${domain}`

    const mockFetchDataResponse: Right<
      Api.ResponseSuccess<UnstoppableApiGetCryptoAddressResponse>
    > = {
      tag: 'right',
      value: {
        data: mockApiResponse,
        status: 200,
      },
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getCryptoAddress = unstoppableApiGetCryptoAddress(mockOptions, {
      request: mockFetchData,
    })

    await expect(() => getCryptoAddress(domain)).rejects.toThrow(
      Resolver.Errors.UnsupportedTld,
    )
    expect(mockFetchData).not.toHaveBeenCalledWith(
      {
        headers: {
          'Content-Type': 'application/json',
          'Bearer': mockOptions.apiKey,
        },
        url: expectedUrl,
      },
      undefined,
    )
  })

  it('should throw invalid response if the response doesnt contain the address for ada', async () => {
    const domain = mockApiResponse.meta.domain
    const expectedUrl = `${unstoppableApiConfig.mainnet.getCryptoAddress}${domain}`
    const invalidApiResponse = {
      ...mockApiResponse,
      records: {'crypto.ADA.address': 123},
    }

    const mockFetchDataResponse: Right<
      Api.ResponseSuccess<UnstoppableApiGetCryptoAddressResponse>
    > = {
      tag: 'right',
      value: {
        data: invalidApiResponse as any,
        status: 200,
      },
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getCryptoAddress = unstoppableApiGetCryptoAddress(mockOptions, {
      request: mockFetchData,
    })

    await expect(() => getCryptoAddress(domain)).rejects.toThrow(
      Resolver.Errors.InvalidResponse,
    )
    expect(mockFetchData).toHaveBeenCalledWith(
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockOptions.apiKey}`,
        },
        url: expectedUrl,
      },
      undefined,
    )
  })

  it('should throw invalid response if the response doesnt contain the address for ada 2', async () => {
    const domain = mockApiResponse.meta.domain
    const expectedUrl = `${unstoppableApiConfig.mainnet.getCryptoAddress}${domain}`
    const invalidApiResponse = {
      ...mockApiResponse,
      records: {'crypto.ADA.address': undefined},
    }

    const mockFetchDataResponse: Right<
      Api.ResponseSuccess<UnstoppableApiGetCryptoAddressResponse>
    > = {
      tag: 'right',
      value: {
        data: invalidApiResponse as any,
        status: 200,
      },
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getCryptoAddress = unstoppableApiGetCryptoAddress(mockOptions, {
      request: mockFetchData,
    })

    await expect(() => getCryptoAddress(domain)).rejects.toThrow(
      Resolver.Errors.InvalidResponse,
    )
    expect(mockFetchData).toHaveBeenCalledWith(
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockOptions.apiKey}`,
        },
        url: expectedUrl,
      },
      undefined,
    )
  })

  it('should throw not found if the response doesnt contain the address for ada', async () => {
    const domain = mockApiResponse.meta.domain
    const expectedUrl = `${unstoppableApiConfig.mainnet.getCryptoAddress}${domain}`
    const invalidApiResponse = {
      ...mockApiResponse,
      records: {},
    }

    const mockFetchDataResponse: Right<
      Api.ResponseSuccess<UnstoppableApiGetCryptoAddressResponse>
    > = {
      tag: 'right',
      value: {
        data: invalidApiResponse as any,
        status: 200,
      },
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getCryptoAddress = unstoppableApiGetCryptoAddress(mockOptions, {
      request: mockFetchData,
    })

    await expect(() => getCryptoAddress(domain)).rejects.toThrow(
      Resolver.Errors.NotFound,
    )
    expect(mockFetchData).toHaveBeenCalledWith(
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockOptions.apiKey}`,
        },
        url: expectedUrl,
      },
      undefined,
    )
  })

  it('should throw invalid blockchain if the response contain the address for other blockchain', async () => {
    const domain = mockApiResponse.meta.domain
    const expectedUrl = `${unstoppableApiConfig.mainnet.getCryptoAddress}${domain}`
    const invalidApiResponse = {
      ...mockApiResponse,
      records: {'crypto.ETH.address': 'fake-address'},
    }

    const mockFetchDataResponse: Right<
      Api.ResponseSuccess<UnstoppableApiGetCryptoAddressResponse>
    > = {
      tag: 'right',
      value: {
        data: invalidApiResponse as any,
        status: 200,
      },
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getCryptoAddress = unstoppableApiGetCryptoAddress(mockOptions, {
      request: mockFetchData,
    })

    await expect(() => getCryptoAddress(domain)).rejects.toThrow(
      Resolver.Errors.InvalidBlockchain,
    )
    expect(mockFetchData).toHaveBeenCalledWith(
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockOptions.apiKey}`,
        },
        url: expectedUrl,
      },
      undefined,
    )
  })

  it('should throw not found if the ada handle doesnt have an owner yet', async () => {
    const domain = mockApiResponse.meta.domain
    const expectedUrl = `${unstoppableApiConfig.mainnet.getCryptoAddress}${domain}`
    const errorApiResponse: Api.ResponseError = {
      status: 404,
      message: 'Not found',
      responseData: null,
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
      Resolver.Errors.NotFound,
    )
    expect(mockFetchData).toHaveBeenCalledWith(
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockOptions.apiKey}`,
        },
        url: expectedUrl,
      },
      undefined,
    )
  })

  it('should rethrow the api error if hasnt a map to a handle error', async () => {
    const domain = mockApiResponse.meta.domain
    const expectedUrl = `${unstoppableApiConfig.mainnet.getCryptoAddress}${domain}`
    const errorApiResponse: Api.ResponseError = {
      status: 425,
      message: 'Too Early',
      responseData: null,
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
    expect(mockFetchData).toHaveBeenCalledWith(
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockOptions.apiKey}`,
        },
        url: expectedUrl,
      },
      undefined,
    )
  })

  it('should throw an "UnsupportedTld" error when the api does not support a tld', async () => {
    const domain = mockApiResponse.meta.domain
    const expectedUrl = `${unstoppableApiConfig.mainnet.getCryptoAddress}${domain}`
    const errorApiResponse: Api.ResponseError = {
      status: 425,
      message: 'Fake Message',
      responseData: {
        message: 'Unsupported TLD',
      },
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
      Resolver.Errors.UnsupportedTld,
    )
    expect(mockFetchData).toHaveBeenCalledWith(
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockOptions.apiKey}`,
        },
        url: expectedUrl,
      },
      undefined,
    )
  })

  it('should build without dependencies (coverage only)', () => {
    const getCryptoAddress = unstoppableApiGetCryptoAddress(mockOptions)
    expect(getCryptoAddress).toBeDefined()
  })
})
