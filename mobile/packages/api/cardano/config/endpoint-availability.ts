import {CardanoBackend} from '../types'

/**
 * Hardcoded mapping of endpoints to backends that support them
 * Used by the API manager to determine which adapter can handle each endpoint
 */
export const ENDPOINT_AVAILABILITY: Record<string, CardanoBackend[]> = {
  getTipStatus: ['backend-zero', 'legacy'],
  fetchNewTxHistory: ['backend-zero', 'legacy'],
  filterUsedAddresses: ['backend-zero', 'legacy'],
  submitTransaction: ['backend-zero', 'legacy'],
  getAccountState: ['backend-zero', 'legacy'],
  bulkGetAccountState: ['backend-zero', 'legacy'],
  getPoolInfo: ['backend-zero', 'legacy'],
  fetchTxStatus: ['backend-zero', 'legacy'],
  checkServerStatus: ['legacy'],
  getFundInfo: ['legacy'],
} as const

/**
 * Endpoints that require wallet context when using backend-zero
 */
export const BACKEND_ZERO_REQUIRES_CONTEXT: Set<string> = new Set([
  'fetchNewTxHistory',
  'filterUsedAddresses',
  'getAccountState',
  'bulkGetAccountState',
])

