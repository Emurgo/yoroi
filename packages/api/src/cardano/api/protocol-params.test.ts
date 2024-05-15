import {getProtocolParams, isProtocolParamsResponse} from './protocol-params'
import {paramsMockResponse} from './protocol-params.mocks'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.MockedFunction<typeof axios>

describe('getProtocolParams', () => {
  const baseUrl = 'https://localhost'
  const mockFetch = jest.fn()
  const customFetcher = jest.fn().mockResolvedValue(paramsMockResponse)

  it('returns parsed data when response is valid', async () => {
    mockFetch.mockResolvedValue(paramsMockResponse)
    const protocolParams = getProtocolParams(baseUrl, mockFetch)
    const result = await protocolParams()
    expect(result).toEqual(paramsMockResponse)
  })

  it('throws an error if response is not valid', async () => {
    mockFetch.mockResolvedValue(null)
    const protocolParams = getProtocolParams(baseUrl, mockFetch)
    await expect(protocolParams()).rejects.toThrow(
      'Invalid protocol params response',
    )
  })

  it('rejects when response data fails validation', async () => {
    const invalidResponse = {unexpectedField: 'invalid data'}
    mockFetch.mockResolvedValue(invalidResponse)
    const protocolParams = getProtocolParams('https://localhost', mockFetch)

    await expect(protocolParams()).rejects.toThrow(
      'Invalid protocol params response',
    )
  })

  it('uses a custom fetcher function', async () => {
    const protocolParams = getProtocolParams(baseUrl, customFetcher)
    const result = await protocolParams()
    expect(customFetcher).toHaveBeenCalled()
    expect(result).toEqual(paramsMockResponse)
  })
  it('uses fetcher and returns data on successful fetch', async () => {
    mockedAxios.mockResolvedValue({data: paramsMockResponse})

    const protocolParams = getProtocolParams(baseUrl)
    const result = await protocolParams()

    expect(mockedAxios).toHaveBeenCalled()
    expect(result).toEqual(paramsMockResponse)
  })

  it('throws an error on network issues', async () => {
    const networkError = new Error('Network Error')
    mockFetch.mockRejectedValue(networkError)
    const protocolParams = getProtocolParams(baseUrl, mockFetch)
    await expect(protocolParams()).rejects.toThrow(networkError.message)
  })
})
describe('isProtocolParamsResponse', () => {
  it('returns true for a valid protocol parameters response', () => {
    expect(isProtocolParamsResponse(paramsMockResponse)).toBe(true)
  })

  it('returns false for an invalid protocol parameters response', () => {
    const invalidResponse = {...paramsMockResponse, epoch: 'invalid'}
    expect(isProtocolParamsResponse(invalidResponse)).toBe(true)
  })

  it('returns false for an incomplete protocol parameters response', () => {
    const incompleteResponse = {min_fee_a: 44, min_fee_b: 155381}
    expect(isProtocolParamsResponse(incompleteResponse)).toBe(false)
  })
})
