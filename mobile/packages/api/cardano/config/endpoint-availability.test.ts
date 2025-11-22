import {CardanoBackend} from '../types'
import {
  BACKEND_ZERO_REQUIRES_CONTEXT,
  ENDPOINT_AVAILABILITY,
} from './endpoint-availability'

describe('ENDPOINT_AVAILABILITY', () => {
  it('should have availability for all endpoints', () => {
    const endpoints = [
      'getTipStatus',
      'fetchNewTxHistory',
      'filterUsedAddresses',
      'submitTransaction',
      'getAccountState',
      'bulkGetAccountState',
      'getPoolInfo',
      'fetchTxStatus',
      'checkServerStatus',
      'getFundInfo',
    ]

    endpoints.forEach((endpoint) => {
      expect(ENDPOINT_AVAILABILITY[endpoint]).toBeDefined()
      expect(Array.isArray(ENDPOINT_AVAILABILITY[endpoint])).toBe(true)
      expect(ENDPOINT_AVAILABILITY[endpoint].length).toBeGreaterThan(0)
    })
  })

  it('should have correct backends for endpoints available in both', () => {
    const bothBackends: string[] = [
      'getTipStatus',
      'fetchNewTxHistory',
      'filterUsedAddresses',
      'submitTransaction',
      'getAccountState',
      'bulkGetAccountState',
      'getPoolInfo',
      'fetchTxStatus',
    ]

    bothBackends.forEach((endpoint) => {
      const available = ENDPOINT_AVAILABILITY[endpoint]
      expect(available).toContain('backend-zero')
      expect(available).toContain('legacy')
    })
  })

  it('should have legacy-only endpoints', () => {
    expect(ENDPOINT_AVAILABILITY.checkServerStatus).toEqual(['legacy'])
    expect(ENDPOINT_AVAILABILITY.getFundInfo).toEqual(['legacy'])
  })

  it('should have valid backend values', () => {
    Object.values(ENDPOINT_AVAILABILITY).forEach((backends) => {
      backends.forEach((backend) => {
        expect(['backend-zero', 'legacy']).toContain(backend)
      })
    })
  })
})

describe('BACKEND_ZERO_REQUIRES_CONTEXT', () => {
  it('should be a Set', () => {
    expect(BACKEND_ZERO_REQUIRES_CONTEXT instanceof Set).toBe(true)
  })

  it('should contain endpoints that require context', () => {
    const expectedEndpoints = [
      'fetchNewTxHistory',
      'filterUsedAddresses',
      'getAccountState',
      'bulkGetAccountState',
    ]

    expectedEndpoints.forEach((endpoint) => {
      expect(BACKEND_ZERO_REQUIRES_CONTEXT.has(endpoint)).toBe(true)
    })
  })

  it('should not contain endpoints that do not require context', () => {
    const noContextEndpoints = [
      'getTipStatus',
      'submitTransaction',
      'getPoolInfo',
      'fetchTxStatus',
      'checkServerStatus',
      'getFundInfo',
    ]

    noContextEndpoints.forEach((endpoint) => {
      expect(BACKEND_ZERO_REQUIRES_CONTEXT.has(endpoint)).toBe(false)
    })
  })

  it('should only contain endpoints that exist in ENDPOINT_AVAILABILITY', () => {
    BACKEND_ZERO_REQUIRES_CONTEXT.forEach((endpoint) => {
      expect(ENDPOINT_AVAILABILITY[endpoint]).toBeDefined()
    })
  })
})

