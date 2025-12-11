import {isRight} from '@yoroi/common'

import {poolTransitionGetInfo} from './pool-transition-api'

const mockFetchData = jest.fn()
const mockBaseApiUrl = 'https://api.example.com'

describe('poolTransitionGetInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return transition data when API call succeeds', async () => {
    const mockTransitionData = {
      new: {emurgo: ['pool1']},
      old: {emurgo: [['pool1', 1234567890, true]]},
      saturationThreshold: 0.8,
    }
    mockFetchData.mockResolvedValue({
      tag: 'right',
      value: {
        status: 200,
        data: mockTransitionData,
      },
    })

    const getInfoFn = poolTransitionGetInfo({
      request: mockFetchData,
      baseApiUrl: mockBaseApiUrl,
    })

    const result = await getInfoFn()

    expect(result.tag).toBe('right')
    if (isRight(result)) {
      expect(result.value.data).toEqual(mockTransitionData)
      expect(result.value.status).toBe(200)
    }
    expect(mockFetchData).toHaveBeenCalledWith({
      url: `${mockBaseApiUrl}/v2.1/pools/poolTransitionInfo`,
      method: 'get',
    })
  })

  it('should return null data when API call fails', async () => {
    mockFetchData.mockResolvedValue({
      tag: 'left',
      value: new Error('API Error'),
    })

    const getInfoFn = poolTransitionGetInfo({
      request: mockFetchData,
      baseApiUrl: mockBaseApiUrl,
    })

    const result = await getInfoFn()

    expect(result.tag).toBe('right')
    if (isRight(result)) {
      expect(result.value.data).toBeNull()
      expect(result.value.status).toBe(200)
    }
  })

  it('should freeze the response', async () => {
    const mockTransitionData = {
      new: {emurgo: ['pool1']},
      old: {emurgo: [['pool1', 1234567890, true]]},
    }
    mockFetchData.mockResolvedValue({
      tag: 'right',
      value: {
        status: 200,
        data: mockTransitionData,
      },
    })

    const getInfoFn = poolTransitionGetInfo({
      request: mockFetchData,
      baseApiUrl: mockBaseApiUrl,
    })

    const result = await getInfoFn()

    expect(Object.isFrozen(result)).toBe(true)
  })
})
