import {getBestBlock, isBestBlock} from './best-block'
import {bestBlockMockResponse} from './best-block.mocks'
import {fetcher, Fetcher} from '@yoroi/common'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.MockedFunction<typeof axios>

describe('getBestBlock', () => {
  const baseUrl = 'https://localhost'
  const mockFetch = jest.fn()
  const customFetcher: Fetcher = jest
    .fn()
    .mockResolvedValue(bestBlockMockResponse)

  it('returns parsed data when response is valid', async () => {
    mockFetch.mockResolvedValue(bestBlockMockResponse)
    const tipStatus = getBestBlock(baseUrl, mockFetch)
    const result = await tipStatus()
    expect(result).toEqual(bestBlockMockResponse)
  })

  it('throws an error if response is invalid', async () => {
    mockFetch.mockResolvedValue(null)
    const tipStatus = getBestBlock(baseUrl, mockFetch)
    await expect(tipStatus()).rejects.toThrow('Invalid best block response')
  })

  it('rejects when response data fails validation', async () => {
    const invalidResponse = {unexpectedField: 'invalid data'}
    mockFetch.mockResolvedValue(invalidResponse)
    const tipStatus = getBestBlock(baseUrl, mockFetch)

    await expect(tipStatus()).rejects.toThrow('Invalid best block response')
  })

  it('uses a custom fetcher function', async () => {
    const tipStatus = getBestBlock(baseUrl, customFetcher)
    const result = await tipStatus()
    expect(customFetcher).toHaveBeenCalled()
    expect(result).toEqual(bestBlockMockResponse)

    // coverage
    const tipStatus2 = getBestBlock(baseUrl)
    expect(tipStatus2).toBeDefined()
  })

  it('uses fetcher and returns data on successful fetch', async () => {
    mockedAxios.mockResolvedValue({data: bestBlockMockResponse})
    const tipStatus = getBestBlock(baseUrl, fetcher)
    const result = await tipStatus()

    expect(mockedAxios).toHaveBeenCalled()
    expect(result).toEqual(bestBlockMockResponse)
  })

  it('throws an error on network issues', async () => {
    const networkError = new Error('Network Error')
    mockFetch.mockRejectedValue(networkError)
    const tipStatus = getBestBlock(baseUrl, mockFetch)
    await expect(tipStatus()).rejects.toThrow(networkError.message)
  })
})

describe('isBestBlock', () => {
  it('returns true for a valid best block response', () => {
    expect(isBestBlock(bestBlockMockResponse)).toBe(true)
  })

  it('returns false for an invalid best block response', () => {
    const invalidResponse = {...bestBlockMockResponse, epoch: 'invalid'}
    expect(isBestBlock(invalidResponse)).toBe(false)
  })

  it('returns false for an incomplete best block response', () => {
    const incompleteResponse = {bestBlock: {epoch: 1}} // Missing fields
    expect(isBestBlock(incompleteResponse)).toBe(false)
  })
})
