import {Chain} from '@yoroi/types'

import {API_ENDPOINTS} from '../api/config'

/**
 * Get backend-zero base URL from legacy API URL
 */
export const getBackendZeroUrl = (legacyApiUrl: string): string => {
  if (legacyApiUrl.includes('api.yoroiwallet.com')) {
    return API_ENDPOINTS[Chain.Network.Mainnet].root
  }
  if (legacyApiUrl.includes('preprod-backend.yoroiwallet.com')) {
    return API_ENDPOINTS[Chain.Network.Preprod].root
  }
  if (legacyApiUrl.includes('preview-backend.emurgornd.com')) {
    return API_ENDPOINTS[Chain.Network.Preview].root
  }
  // Default to mainnet if can't determine
  return API_ENDPOINTS[Chain.Network.Mainnet].root
}

