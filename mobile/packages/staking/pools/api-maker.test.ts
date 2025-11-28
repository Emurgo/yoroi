import {init} from '@emurgo/cross-csl-nodejs'

import {poolInfoApiMaker} from './api-maker'
import {
  getMaybeNewEntriesByPool,
  normalisePoolIdentifierOrKey,
} from './pool-info-api'
import {
  getManyChainPoolInfoBatch,
  getManyExplorerPoolInfo,
  getPoolTransitionInfo,
  getSingleExplorerPoolInfo,
} from './pool-info-api-helpers'

jest.mock('./pool-info-api-helpers')
jest.mock('./pool-info-api', () => {
  const actual = jest.requireActual('./pool-info-api')
  return {
    ...actual,
    normalisePoolIdentifierOrKey: jest.fn(),
    getMaybeNewEntriesByPool: jest.fn(),
  }
})

const mockFetchData = jest.fn()
const mockZeroApiUrl = 'https://api.example.com'
const mockLegacyApiBaseUrl = 'https://legacy.example.com'
const mockWasmModule = init('test')
const mockWasmFactory = (_scope: string) => mockWasmModule

const mockExplorerPoolInfo = {
  id: 'pool123',
  hash: 'hash123',
  ticker: 'TICK',
  name: 'Pool Name',
  pic: 'https://example.com/pic.png',
  stake: '1000000000',
  roa: '0.05',
  taxFix: '340000000',
  taxRatio: '0.01',
  saturation: '0.5',
}

const mockChainPoolInfo = {
  info: {
    name: 'Pool Name',
    ticker: 'TICK',
    description: undefined,
    homepage: undefined,
  },
  history: [],
}

describe('poolInfoApiMaker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getSingleExplorerPoolInfo as jest.Mock).mockResolvedValue(
      mockExplorerPoolInfo,
    )
    ;(getManyChainPoolInfoBatch as jest.Mock).mockResolvedValue({
      hash123: mockChainPoolInfo,
    })
    ;(getManyExplorerPoolInfo as jest.Mock).mockResolvedValue({
      hash123: mockExplorerPoolInfo,
    })
    ;(getPoolTransitionInfo as jest.Mock).mockResolvedValue({
      new: {emurgo: ['pool1']},
      old: {emurgo: [['pool1', 1234567890, true]]},
      saturationThreshold: 0.8,
    })
    ;(normalisePoolIdentifierOrKey as jest.Mock).mockResolvedValue({
      id: 'pool123',
      hash: 'hash123',
    })
    ;(getMaybeNewEntriesByPool as jest.Mock).mockReturnValue({
      newEntries: ['pool1'],
      deadline: 1234567890,
    })
  })

  describe('instantiation', () => {
    it('should create api with default request', () => {
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
      })
      expect(api).toBeDefined()
      expect(api.getPool).toBeDefined()
      expect(api.getSingleFullPoolInfo).toBeDefined()
    })

    it('should create api with custom request', () => {
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })
      expect(api).toBeDefined()
    })
  })

  describe('getPool', () => {
    it('should return pool info', async () => {
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getPool('hash123')

      expect(result).toEqual(mockExplorerPoolInfo)
      expect(getSingleExplorerPoolInfo).toHaveBeenCalledWith({
        hash: 'hash123',
        request: mockFetchData,
        zeroApiUrl: mockZeroApiUrl,
      })
    })

    it('should return null when pool not found', async () => {
      ;(getSingleExplorerPoolInfo as jest.Mock).mockResolvedValueOnce(null)
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getPool('hash123')

      expect(result).toBeNull()
    })
  })

  describe('getSingleExplorerPoolInfo', () => {
    it('should return pool info', async () => {
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getSingleExplorerPoolInfo('hash123')

      expect(result).toEqual(mockExplorerPoolInfo)
    })
  })

  describe('getManyExplorerPoolInfo', () => {
    it('should return pool info map', async () => {
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getManyExplorerPoolInfo(['hash123', 'hash456'])

      expect(result).toHaveProperty('hash123')
      expect(getManyExplorerPoolInfo).toHaveBeenCalled()
    })
  })

  describe('getSingleChainPoolInfo', () => {
    it('should return chain pool info', async () => {
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getSingleChainPoolInfo('hash123')

      expect(result).toEqual(mockChainPoolInfo)
    })

    it('should return null when pool not found', async () => {
      ;(getManyChainPoolInfoBatch as jest.Mock).mockResolvedValueOnce({})
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getSingleChainPoolInfo('hash123')

      expect(result).toBeNull()
    })
  })

  describe('getManyChainPoolInfo', () => {
    it('should return chain pool info map', async () => {
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getManyChainPoolInfo(['hash123'])

      expect(result).toHaveProperty('hash123')
    })

    it('should handle multiple batches', async () => {
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      // Create 100 hashes to trigger batching (requestSize is 50)
      const hashes = Array.from({length: 100}, (_, i) => `hash${i}`)
      await api.getManyChainPoolInfo(hashes)

      expect(getManyChainPoolInfoBatch).toHaveBeenCalledTimes(2)
    })
  })

  describe('getSingleFullPoolInfo', () => {
    it('should return full pool info with chain info', async () => {
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getSingleFullPoolInfo('hash123')

      expect(result).toEqual({
        chain: mockChainPoolInfo,
        explorer: mockExplorerPoolInfo,
      })
    })

    it('should return full pool info with only explorer info', async () => {
      ;(getManyChainPoolInfoBatch as jest.Mock).mockResolvedValueOnce({})
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getSingleFullPoolInfo('hash123')

      expect(result).toEqual({
        chain: undefined,
        explorer: mockExplorerPoolInfo,
      })
    })

    it('should return null when neither chain nor explorer info available', async () => {
      ;(getManyChainPoolInfoBatch as jest.Mock).mockResolvedValueOnce({})
      ;(getManyExplorerPoolInfo as jest.Mock).mockResolvedValueOnce({})
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getSingleFullPoolInfo('hash123')

      expect(result).toBeNull()
    })
  })

  describe('getManyFullPoolInfo', () => {
    it('should return full pool info map', async () => {
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getManyFullPoolInfo(['hash123'])

      expect(result).toHaveProperty('hash123')
      expect(result.hash123).toEqual({
        chain: mockChainPoolInfo,
        explorer: mockExplorerPoolInfo,
      })
    })
  })

  describe('getPoolTransitionInfoPublic', () => {
    it('should return transition info', async () => {
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getPoolTransitionInfoPublic()

      expect(result).toBeDefined()
      expect(getPoolTransitionInfo).toHaveBeenCalledWith({
        request: mockFetchData,
        baseApiUrl: mockLegacyApiBaseUrl,
      })
    })
  })

  describe('getTransition', () => {
    it('should return transition when all conditions are met', async () => {
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getTransition('hash123', mockWasmFactory)

      expect(result).toEqual({
        current: mockExplorerPoolInfo,
        suggested: mockExplorerPoolInfo,
        deadlineMilliseconds: 1234567890,
      })
    })

    it('should return null when transition data is null', async () => {
      ;(getPoolTransitionInfo as jest.Mock).mockResolvedValueOnce(null)
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getTransition('hash123', mockWasmFactory)

      expect(result).toBeNull()
    })

    it('should return null when suggestion is null', async () => {
      ;(getMaybeNewEntriesByPool as jest.Mock).mockReturnValueOnce(null)
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getTransition('hash123', mockWasmFactory)

      expect(result).toBeNull()
    })

    it('should return null when current pool is null', async () => {
      ;(getSingleExplorerPoolInfo as jest.Mock).mockResolvedValueOnce(null)
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getTransition('hash123', mockWasmFactory)

      expect(result).toBeNull()
    })

    it('should return null when suggested pool is null', async () => {
      ;(getSingleExplorerPoolInfo as jest.Mock)
        .mockResolvedValueOnce(mockExplorerPoolInfo) // current
        .mockResolvedValueOnce(null) // suggested
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getTransition('hash123', mockWasmFactory)

      expect(result).toBeNull()
    })

    it('should use default saturation threshold when not provided', async () => {
      ;(getPoolTransitionInfo as jest.Mock).mockResolvedValueOnce({
        new: {emurgo: ['pool1']},
        old: {emurgo: [['pool1', 1234567890, true]]},
      })
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      await api.getTransition('hash123', mockWasmFactory)

      // Verify that getFirstUnsaturatedPoolFn was called with default threshold
      expect(getSingleExplorerPoolInfo).toHaveBeenCalled()
    })

    it('should use default saturation threshold when invalid', async () => {
      ;(getPoolTransitionInfo as jest.Mock).mockResolvedValueOnce({
        new: {emurgo: ['pool1']},
        old: {emurgo: [['pool1', 1234567890, true]]},
        saturationThreshold: 1.5, // Invalid (> 1)
      })
      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      await api.getTransition('hash123', mockWasmFactory)

      expect(getSingleExplorerPoolInfo).toHaveBeenCalled()
    })

    it('should select first unsaturated pool', async () => {
      const saturatedPool = {...mockExplorerPoolInfo, saturation: '0.9'}
      const unsaturatedPool = {...mockExplorerPoolInfo, saturation: '0.5'}
      ;(getSingleExplorerPoolInfo as jest.Mock)
        .mockResolvedValueOnce(mockExplorerPoolInfo) // current
        .mockResolvedValueOnce(saturatedPool) // first suggested (saturated)
        .mockResolvedValueOnce(unsaturatedPool) // second suggested (unsaturated)
      ;(getMaybeNewEntriesByPool as jest.Mock).mockReturnValueOnce({
        newEntries: ['pool1', 'pool2'],
        deadline: 1234567890,
      })

      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getTransition('hash123', mockWasmFactory)

      expect(result).toBeDefined()
      expect(result?.suggested.saturation).toBe('0.5')
    })

    it('should return last pool when all are saturated', async () => {
      const saturatedPool = {...mockExplorerPoolInfo, saturation: '0.9'}
      ;(getSingleExplorerPoolInfo as jest.Mock)
        .mockResolvedValueOnce(mockExplorerPoolInfo) // current
        .mockResolvedValueOnce(saturatedPool) // first suggested
        .mockResolvedValueOnce(saturatedPool) // second suggested
      ;(getMaybeNewEntriesByPool as jest.Mock).mockReturnValueOnce({
        newEntries: ['pool1', 'pool2'],
        deadline: 1234567890,
      })

      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getTransition('hash123', mockWasmFactory)

      expect(result).toBeDefined()
      expect(result?.suggested.saturation).toBe('0.9')
    })

    it('should skip null pools when searching for unsaturated pool', async () => {
      const unsaturatedPool = {...mockExplorerPoolInfo, saturation: '0.5'}
      ;(getSingleExplorerPoolInfo as jest.Mock)
        .mockResolvedValueOnce(mockExplorerPoolInfo) // current
        .mockResolvedValueOnce(null) // first suggested (null)
        .mockResolvedValueOnce(unsaturatedPool) // second suggested (unsaturated)
      ;(getMaybeNewEntriesByPool as jest.Mock).mockReturnValueOnce({
        newEntries: ['pool1', 'pool2'],
        deadline: 1234567890,
      })

      const api = poolInfoApiMaker({
        legacyApiBaseUrl: mockLegacyApiBaseUrl,
        zeroApiUrl: mockZeroApiUrl,
        request: mockFetchData,
      })

      const result = await api.getTransition('hash123', mockWasmFactory)

      expect(result).toBeDefined()
      expect(result?.suggested.saturation).toBe('0.5')
    })
  })
})
