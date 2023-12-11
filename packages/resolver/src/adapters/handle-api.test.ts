import {Api, Left, Resolver, Right} from '@yoroi/types'

import {
  HandleApiGetCryptoAddressResponse,
  handleApiConfig,
  handleApiGetCryptoAddress,
} from './handle-api'
import {handleApiMockResponses} from './handle-api.mocks'

describe('getCryptoAddress', () => {
  const mockAddress =
    handleApiMockResponses.getCrypoAddress.resolved_addresses.ada
  const mockApiResponse = handleApiMockResponses.getCrypoAddress

  it('should return the address', async () => {
    const domain = `$${mockApiResponse.name}`
    const sanitizedDomain = `${mockApiResponse.name}`
    const expectedUrl = `${handleApiConfig.mainnet.getCryptoAddress}${sanitizedDomain}`

    const mockFetchDataResponse: Right<HandleApiGetCryptoAddressResponse> = {
      tag: 'right',
      value: mockApiResponse,
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getCryptoAddress = handleApiGetCryptoAddress({request: mockFetchData})

    const result = await getCryptoAddress(domain)

    expect(mockFetchData).toHaveBeenCalledWith({
      url: expectedUrl,
    })
    expect(result).toBe(mockAddress)
  })

  it('should throw invalid domain if the domain provided is not a valid ada handle (doesnt start with $)', async () => {
    const sanitizedDomain = `${mockApiResponse.name}`
    const expectedUrl = `${handleApiConfig.mainnet.getCryptoAddress}${sanitizedDomain}`

    const mockFetchDataResponse: Right<HandleApiGetCryptoAddressResponse> = {
      tag: 'right',
      value: mockApiResponse,
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

    const mockFetchDataResponse: Right<HandleApiGetCryptoAddressResponse> = {
      tag: 'right',
      value: invalidApiResponse as any,
    }
    const mockFetchData = jest.fn().mockReturnValue(mockFetchDataResponse)
    const getCryptoAddress = handleApiGetCryptoAddress({request: mockFetchData})

    await expect(() => getCryptoAddress(domain)).rejects.toThrow(
      Resolver.Errors.InvalidResponse,
    )
    expect(mockFetchData).toHaveBeenCalledWith({
      url: expectedUrl,
    })
  })

  it('should throw not found if the ada handle doesnt have an owner yet', async () => {
    const domain = `$${mockApiResponse.name}`
    const sanitizedDomain = `${mockApiResponse.name}`
    const expectedUrl = `${handleApiConfig.mainnet.getCryptoAddress}${sanitizedDomain}`
    const errorApiResponse: Api.ResponseError = {
      status: 404,
      message: 'Not found',
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
    expect(mockFetchData).toHaveBeenCalledWith({
      url: expectedUrl,
    })
  })

  it('should rethrow the api error if hasnt a map to a handle error', async () => {
    const domain = `$${mockApiResponse.name}`
    const sanitizedDomain = `${mockApiResponse.name}`
    const expectedUrl = `${handleApiConfig.mainnet.getCryptoAddress}${sanitizedDomain}`
    const errorApiResponse: Api.ResponseError = {
      status: 425,
      message: 'Too Early',
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
    expect(mockFetchData).toHaveBeenCalledWith({
      url: expectedUrl,
    })
  })

  it('should build without dependencies (coverage only)', () => {
    const getCryptoAddress = handleApiGetCryptoAddress()
    expect(getCryptoAddress).toBeDefined()
  })
})
