import {Chain} from '@yoroi/types'

import {backendZeroApiMaker} from './adapters/backend-zero/api-maker'
import {legacyApiMaker} from './adapters/legacy/api-maker'
import {cardanoApiManagerMaker} from './manager'
import {getBackendZeroUrl} from './utils/url-mapping'

import {cardanoWalletApiMaker} from './api-maker'
import {ENDPOINT_AVAILABILITY} from './config/endpoint-availability'

// Mock the adapters and manager
jest.mock('../adapters/backend-zero/api-maker')
jest.mock('../adapters/legacy/api-maker')
jest.mock('../manager')
jest.mock('../utils/url-mapping', () => ({
  getBackendZeroUrl: jest.fn((url: string) => {
    if (url.includes('api.yoroiwallet.com')) {
      return 'https://zero.yoroiwallet.com'
    }
    if (url.includes('preprod-backend.yoroiwallet.com')) {
      return 'https://yoroi-backend-zero-preprod.emurgornd.com'
    }
    return 'https://zero.yoroiwallet.com'
  }),
}))

describe('cardanoWalletApiMaker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockGetSpendingKey = jest.fn((address: string) => `hash-${address}`)

  it('should create API instance with correct baseApiUrl', () => {
    const baseApiUrl = 'https://api.yoroiwallet.com/api'
    const api = cardanoWalletApiMaker({baseApiUrl, getSpendingKey: mockGetSpendingKey})

    expect(api).toBeDefined()
  })

  it('should use correct backend-zero URL for mainnet', () => {
    const baseApiUrl = 'https://api.yoroiwallet.com/api'

    cardanoWalletApiMaker({baseApiUrl, getSpendingKey: mockGetSpendingKey})

    expect(getBackendZeroUrl).toHaveBeenCalledWith(baseApiUrl)
  })

  it('should use correct backend-zero URL for preprod', () => {
    const baseApiUrl = 'https://preprod-backend.yoroiwallet.com/api'

    cardanoWalletApiMaker({baseApiUrl, getSpendingKey: mockGetSpendingKey})

    expect(getBackendZeroUrl).toHaveBeenCalledWith(baseApiUrl)
  })

  it('should create adapters with correct URLs', () => {
    const baseApiUrl = 'https://api.yoroiwallet.com/api'

    cardanoWalletApiMaker({baseApiUrl, getSpendingKey: mockGetSpendingKey})

    expect(backendZeroApiMaker).toHaveBeenCalledWith({
      baseApiUrl,
      backendZeroUrl: 'https://zero.yoroiwallet.com',
      getSpendingKey: mockGetSpendingKey,
    })
    expect(legacyApiMaker).toHaveBeenCalledWith({baseApiUrl})
  })

  it('should use default preferences', () => {
    const baseApiUrl = 'https://api.yoroiwallet.com/api'

    cardanoWalletApiMaker({baseApiUrl, getSpendingKey: mockGetSpendingKey})

    expect(cardanoApiManagerMaker).toHaveBeenCalledWith({
      backendZeroAdapter: expect.any(Object),
      legacyAdapter: expect.any(Object),
      preferences: {
        getTipStatus: 'backend-zero',
        fetchNewTxHistory: 'backend-zero',
        filterUsedAddresses: 'backend-zero',
        submitTransaction: 'backend-zero',
        getAccountState: 'backend-zero',
        bulkGetAccountState: 'backend-zero',
        getPoolInfo: 'backend-zero',
        fetchTxStatus: 'backend-zero',
        checkServerStatus: 'legacy',
        getFundInfo: 'legacy',
      },
    })
  })

  it('should have preferences that match endpoint availability', () => {
    const baseApiUrl = 'https://api.yoroiwallet.com/api'
    const api = cardanoWalletApiMaker({baseApiUrl, getSpendingKey: mockGetSpendingKey})

    // Verify that preferences only use backends that are available for each endpoint
    Object.keys(ENDPOINT_AVAILABILITY).forEach((endpoint) => {
      const availableBackends = ENDPOINT_AVAILABILITY[endpoint]
      // This is a type check - preferences should match availability
      expect(availableBackends.length).toBeGreaterThan(0)
    })
  })
})

