import {poolTransitionGetInfo} from './adapters/api/pool-transition-api'
import {TRANSITION_DATA_STUB} from './pool-info-api'
import {
  getManyChainPoolInfoBatch,
  getManyExplorerPoolInfo,
  getPoolTransitionInfo,
  getSingleExplorerPoolInfo,
} from './pool-info-api-helpers'

jest.mock('./adapters/api/pool-transition-api')

const mockFetchData = jest.fn()
const mockZeroApiUrl = 'https://api.example.com'
const mockLegacyApiBaseUrl = 'https://legacy.example.com'

describe('pool-info-api-helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getSingleExplorerPoolInfo', () => {
    it('should return pool info when API call succeeds', async () => {
      const mockPool = {
        pool_id: 'pool123',
        pool_id_hash_raw: 'hash123',
        pool_name: {ticker: 'TICK', name: 'Pool Name'},
        pool_update: {
          active: {fixed_cost: 340000000, margin: 0.01},
        },
        stats: {lifetime: {roa: 0.05}},
        live_stake: 1000000000,
        roa: '0.05',
        saturation: 0.8,
      }
      mockFetchData.mockResolvedValue({
        tag: 'right',
        value: {
          status: 200,
          data: {
            data: {
              data: [mockPool],
            },
          },
        },
      })

      const result = await getSingleExplorerPoolInfo({
        hash: 'hash123',
        request: mockFetchData,
        zeroApiUrl: mockZeroApiUrl,
      })

      expect(result).toEqual({
        id: 'pool123',
        hash: 'hash123',
        ticker: 'TICK',
        name: 'Pool Name',
        pic: 'https://ix.cexplorer.io/pool123',
        stake: '1000000000',
        roa: '0.05',
        taxFix: '340000000',
        taxRatio: '0.01',
        saturation: '0.8',
      })
    })

    it('should return null when API call fails', async () => {
      mockFetchData.mockResolvedValue({
        tag: 'left',
        value: new Error('API Error'),
      })

      const result = await getSingleExplorerPoolInfo({
        hash: 'hash123',
        request: mockFetchData,
        zeroApiUrl: mockZeroApiUrl,
      })

      expect(result).toBeNull()
    })

    it('should return null when no pools are returned', async () => {
      mockFetchData.mockResolvedValue({
        tag: 'right',
        value: {
          status: 200,
          data: {
            data: {
              data: [],
            },
          },
        },
      })

      const result = await getSingleExplorerPoolInfo({
        hash: 'hash123',
        request: mockFetchData,
        zeroApiUrl: mockZeroApiUrl,
      })

      expect(result).toBeNull()
    })
  })

  describe('getManyChainPoolInfoBatch', () => {
    it('should return pool info map for multiple hashes', async () => {
      const mockPool = {
        pool_id: 'pool123',
        pool_id_hash_raw: 'hash123',
        pool_name: {ticker: 'TICK', name: 'Pool Name'},
        pool_update: {
          active: {fixed_cost: 340000000, margin: 0.01},
        },
        stats: {lifetime: {roa: 0.05}},
        live_stake: 1000000000,
        roa: '0.05',
        saturation: 0.8,
      }
      mockFetchData.mockResolvedValue({
        tag: 'right',
        value: {
          status: 200,
          data: {
            data: {
              data: [mockPool],
            },
          },
        },
      })

      const result = await getManyChainPoolInfoBatch({
        hashes: ['hash123', 'hash456'],
        request: mockFetchData,
        zeroApiUrl: mockZeroApiUrl,
        requestSize: 50,
      })

      expect(result).toHaveProperty('hash123')
      expect(result.hash123).toEqual({
        info: {
          name: 'Pool Name',
          ticker: 'TICK',
          description: undefined,
          homepage: undefined,
        },
        history: [],
      })
    })

    it('should return null for hashes that fail', async () => {
      mockFetchData.mockRejectedValue(new Error('Network error'))

      const result = await getManyChainPoolInfoBatch({
        hashes: ['hash123'],
        request: mockFetchData,
        zeroApiUrl: mockZeroApiUrl,
        requestSize: 50,
      })

      expect(result.hash123).toBeNull()
    })

    it('should return null for hashes with no pool data', async () => {
      mockFetchData.mockResolvedValue({
        tag: 'right',
        value: {
          status: 200,
          data: {
            data: {
              data: [],
            },
          },
        },
      })

      const result = await getManyChainPoolInfoBatch({
        hashes: ['hash123'],
        request: mockFetchData,
        zeroApiUrl: mockZeroApiUrl,
        requestSize: 50,
      })

      expect(result.hash123).toBeNull()
    })
  })

  describe('getManyExplorerPoolInfo', () => {
    it('should return pool info map for multiple hashes', async () => {
      const mockGetSingle = jest
        .fn()
        .mockResolvedValueOnce({
          id: 'pool123',
          hash: 'hash123',
          ticker: 'TICK',
          name: 'Pool Name',
          pic: null,
          stake: '1000000000',
          roa: '0.05',
          taxFix: '340000000',
          taxRatio: '0.01',
          saturation: '0.8',
        })
        .mockResolvedValueOnce(null)

      const result = await getManyExplorerPoolInfo({
        hashes: ['hash123', 'hash456'],
        getSingleExplorerPoolInfo: mockGetSingle,
      })

      expect(result).toHaveProperty('hash123')
      expect(result.hash123).not.toBeNull()
      expect(result.hash456).toBeNull()
      expect(mockGetSingle).toHaveBeenCalledTimes(2)
    })
  })

  describe('getPoolTransitionInfo', () => {
    it('should return transition data when API call succeeds', async () => {
      const mockTransitionData = {
        new: {emurgo: ['pool1']},
        old: {emurgo: [['pool1', 1234567890, true]]},
        saturationThreshold: 0.8,
      }
      const mockGetPoolTransitionInfoFn = jest.fn().mockResolvedValue({
        tag: 'right',
        value: {status: 200, data: mockTransitionData},
      })
      ;(poolTransitionGetInfo as jest.Mock).mockReturnValue(
        mockGetPoolTransitionInfoFn,
      )

      const result = await getPoolTransitionInfo({
        request: mockFetchData,
        baseApiUrl: mockLegacyApiBaseUrl,
      })

      expect(result).toEqual(mockTransitionData)
      expect(poolTransitionGetInfo).toHaveBeenCalledWith({
        request: mockFetchData,
        baseApiUrl: mockLegacyApiBaseUrl,
      })
    })

    it('should return TRANSITION_DATA_STUB when API call fails', async () => {
      const mockGetPoolTransitionInfoFn = jest
        .fn()
        .mockRejectedValue(new Error('Network error'))
      ;(poolTransitionGetInfo as jest.Mock).mockReturnValue(
        mockGetPoolTransitionInfoFn,
      )

      const result = await getPoolTransitionInfo({
        request: mockFetchData,
        baseApiUrl: mockLegacyApiBaseUrl,
      })

      expect(result).toEqual(TRANSITION_DATA_STUB)
    })

    it('should return TRANSITION_DATA_STUB when response data is null', async () => {
      const mockGetPoolTransitionInfoFn = jest.fn().mockResolvedValue({
        tag: 'right',
        value: {status: 200, data: null},
      })
      ;(poolTransitionGetInfo as jest.Mock).mockReturnValue(
        mockGetPoolTransitionInfoFn,
      )

      const result = await getPoolTransitionInfo({
        request: mockFetchData,
        baseApiUrl: mockLegacyApiBaseUrl,
      })

      expect(result).toEqual(TRANSITION_DATA_STUB)
    })
  })
})
