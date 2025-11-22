import {Api, Left, Resolver, Right} from '@yoroi/types'

import {
  HandleApiGetCryptoAddressResponse,
  getHandleApiError,
  handleApiConfig,
  handleApiGetCryptoAddress,
  handleApiGetDRepId,
} from './api'
import {handleApiMockResponses} from './api.mocks'

describe('getCryptoAddress', () => {
  const mockAddress =
    handleApiMockResponses.getCrypoAddress.resolved_addresses.ada
  const mockApiResponse = handleApiMockResponses.getCrypoAddress

  it('should return the address in mainnet', async () => {
    const domain = `$${mockApiResponse.name}`
    const sanitizedDomain = `${mockApiResponse.name}`
    const expectedUrl = `${handleApiConfig.mainnet.getCryptoAddress}${sanitizedDomain}`
    const isMainnet = true

    const mockFetchDataResponse: Right<
      Api.ResponseSuccess<HandleApiGetCryptoAddressResponse>
    > = {
      tag: 'right',
      value: {
        data: mockApiResponse,
        status: 200,
      },
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getCryptoAddress = handleApiGetCryptoAddress({
      request: mockFetchData,
      isMainnet,
    })

    const result = await getCryptoAddress(domain)

    expect(mockFetchData).toHaveBeenCalledWith(
      {
        url: expectedUrl,
      },
      undefined,
    )
    expect(result).toBe(mockAddress)
  })

  it('should return the address in preprod', async () => {
    const domain = `$${mockApiResponse.name}`
    const sanitizedDomain = `${mockApiResponse.name}`
    const expectedUrl = `${handleApiConfig.preprod.getCryptoAddress}${sanitizedDomain}`
    const isMainnet = false

    const mockFetchDataResponse: Right<
      Api.ResponseSuccess<HandleApiGetCryptoAddressResponse>
    > = {
      tag: 'right',
      value: {
        data: mockApiResponse,
        status: 200,
      },
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getCryptoAddress = handleApiGetCryptoAddress({
      request: mockFetchData,
      isMainnet,
    })

    const result = await getCryptoAddress(domain)

    expect(mockFetchData).toHaveBeenCalledWith(
      {
        url: expectedUrl,
      },
      undefined,
    )
    expect(result).toBe(mockAddress)
  })

  it('should throw invalid domain if the domain provided is not a valid ada handle (doesnt start with $)', async () => {
    const sanitizedDomain = `${mockApiResponse.name}`
    const expectedUrl = `${handleApiConfig.mainnet.getCryptoAddress}${sanitizedDomain}`

    const mockFetchDataResponse: Right<
      Api.ResponseSuccess<HandleApiGetCryptoAddressResponse>
    > = {
      tag: 'right',
      value: {
        data: mockApiResponse,
        status: 200,
      },
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getCryptoAddress = handleApiGetCryptoAddress({request: mockFetchData})

    await expect(() => getCryptoAddress(sanitizedDomain)).rejects.toThrow(
      Resolver.Errors.InvalidDomain,
    )
    expect(mockFetchData).not.toHaveBeenCalledWith({
      url: expectedUrl,
    })
  })

  it('should throw invalid response if the response doesnt contain the address for ada', async () => {
    const domain = `$${mockApiResponse.name}`
    const sanitizedDomain = `${mockApiResponse.name}`
    const expectedUrl = `${handleApiConfig.mainnet.getCryptoAddress}${sanitizedDomain}`
    const invalidApiResponse = {...mockApiResponse, resolved_addresses: {}}

    const mockFetchDataResponse: Right<
      Api.ResponseSuccess<HandleApiGetCryptoAddressResponse>
    > = {
      tag: 'right',
      value: {
        data: invalidApiResponse as any,
        status: 200,
      },
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getCryptoAddress = handleApiGetCryptoAddress({request: mockFetchData})

    await expect(() => getCryptoAddress(domain)).rejects.toThrow(
      Resolver.Errors.InvalidResponse,
    )
    expect(mockFetchData).toHaveBeenCalledWith(
      {
        url: expectedUrl,
      },
      undefined,
    )
  })

  it('should throw not found if the ada handle doesnt have an owner yet', async () => {
    const domain = `$${mockApiResponse.name}`
    const sanitizedDomain = `${mockApiResponse.name}`
    const expectedUrl = `${handleApiConfig.mainnet.getCryptoAddress}${sanitizedDomain}`
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
    const getCryptoAddress = handleApiGetCryptoAddress({request: mockFetchData})

    await expect(() => getCryptoAddress(domain)).rejects.toThrow(
      Resolver.Errors.NotFound,
    )
    expect(mockFetchData).toHaveBeenCalledWith(
      {
        url: expectedUrl,
      },
      undefined,
    )
  })

  it('should rethrow the api error if hasnt a map to a handle error', async () => {
    const domain = `$${mockApiResponse.name}`
    const sanitizedDomain = `${mockApiResponse.name}`
    const expectedUrl = `${handleApiConfig.mainnet.getCryptoAddress}${sanitizedDomain}`
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
    const getCryptoAddress = handleApiGetCryptoAddress({request: mockFetchData})

    await expect(() => getCryptoAddress(domain)).rejects.toThrow(
      Api.Errors.TooEarly,
    )
    expect(mockFetchData).toHaveBeenCalledWith(
      {
        url: expectedUrl,
      },
      undefined,
    )
  })

  it('should build without dependencies (coverage only)', () => {
    const getCryptoAddress = handleApiGetCryptoAddress()
    expect(getCryptoAddress).toBeDefined()
  })
})

describe('handleApiGetDRepId', () => {
  const mockApiResponse = handleApiMockResponses.getCrypoAddress

  it('should return DRep info when present', async () => {
    const domain = `$${mockApiResponse.name}`
    const mockDRepResponse = {
      ...mockApiResponse,
      drep: {
        type: 'drep' as const,
        cred: 'key' as const,
        hex: 'drep123',
        cip_105: 'cip105',
        cip_129: 'cip129',
      },
    }

    const mockFetchDataResponse: Right<
      Api.ResponseSuccess<HandleApiGetCryptoAddressResponse>
    > = {
      tag: 'right',
      value: {
        data: mockDRepResponse,
        status: 200,
      },
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getDRepId = handleApiGetDRepId({
      request: mockFetchData,
      isMainnet: true,
    })

    const result = await getDRepId(domain)

    expect(result).toEqual({
      type: 'drep',
      cred: 'key',
      hex: 'drep123',
      cip_105: 'cip105',
      cip_129: 'cip129',
    })
  })

  it('should return null when DRep info is not present', async () => {
    const domain = `$${mockApiResponse.name}`
    const mockResponseWithoutDRep = {
      ...mockApiResponse,
      drep: undefined,
    }

    const mockFetchDataResponse: Right<
      Api.ResponseSuccess<HandleApiGetCryptoAddressResponse>
    > = {
      tag: 'right',
      value: {
        data: mockResponseWithoutDRep,
        status: 200,
      },
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getDRepId = handleApiGetDRepId({
      request: mockFetchData,
      isMainnet: true,
    })

    const result = await getDRepId(domain)

    expect(result).toBeNull()
  })

  it('should use preprod URL when isMainnet is false', async () => {
    const domain = `$${mockApiResponse.name}`
    const sanitizedDomain = `${mockApiResponse.name}`
    const expectedUrl = `${handleApiConfig.preprod.getCryptoAddress}${sanitizedDomain}`

    const mockFetchDataResponse: Right<
      Api.ResponseSuccess<HandleApiGetCryptoAddressResponse>
    > = {
      tag: 'right',
      value: {
        data: mockApiResponse,
        status: 200,
      },
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getDRepId = handleApiGetDRepId({
      request: mockFetchData,
      isMainnet: false,
    })

    await getDRepId(domain)

    expect(mockFetchData).toHaveBeenCalledWith(
      {
        url: expectedUrl,
      },
      undefined,
    )
  })

  it('should throw invalid domain if domain does not start with $', async () => {
    const domain = 'invalidhandle'

    const mockFetchData = jest.fn()
    const getDRepId = handleApiGetDRepId({request: mockFetchData})

    await expect(() => getDRepId(domain)).rejects.toThrow(
      Resolver.Errors.InvalidDomain,
    )
    expect(mockFetchData).not.toHaveBeenCalled()
  })

  it('should handle errors from API', async () => {
    const domain = `$${mockApiResponse.name}`
    const errorApiResponse: Api.ResponseError = {
      status: 500,
      message: 'Server error',
      responseData: null,
    }

    const mockFetchDataResponse: Left<Api.ResponseError> = {
      tag: 'left',
      error: errorApiResponse,
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getDRepId = handleApiGetDRepId({request: mockFetchData})

    await expect(() => getDRepId(domain)).rejects.toThrow()
  })
})

describe('getHandleApiError', () => {
  it('should return error as-is when not NotFound and no zod error', () => {
    const customError = new Error('Custom error')

    const result = getHandleApiError(customError)

    expect(result).toBe(customError)
  })
})
