/**
 * LEGACY API ONLY METHODS
 * 
 * This file contains API methods that ONLY use the legacy API endpoint.
 * These methods have NO backend-zero equivalent and will continue using legacy API.
 * 
 * TODO: Remove this file when legacy API is fully deprecated.
 */

import {FundInfoResponse} from '~/wallets/types/other'
import {ServerStatus} from '../../types'
import {fetchDefault} from '../fetch'

/**
 * LEGACY ONLY: GET /status
 * 
 * Server health check endpoint.
 * No backend-zero equivalent exists.
 * 
 * Usage: Used for server status checks and time synchronization.
 * Migration: Keep using legacy API until backend-zero adds health check endpoint.
 */
export const checkServerStatus = (baseApiUrl: string): Promise<ServerStatus> =>
  fetchDefault('status', null, baseApiUrl, 'GET')

/**
 * LEGACY ONLY: GET /v0/catalyst/fundInfo/ (or /api/v0/catalyst/fundInfo/ for testnets)
 * 
 * Catalyst governance fund information endpoint.
 * No backend-zero equivalent exists.
 * 
 * Usage: Used for Catalyst voting and governance features.
 * Migration: Keep using legacy API until backend-zero adds Catalyst endpoints.
 */
export const getFundInfo = (
  baseApiUrl: string,
  isMainnet: boolean,
): Promise<FundInfoResponse> => {
  const prefix = isMainnet ? '' : 'api/'
  return fetchDefault(`${prefix}v0/catalyst/fundInfo/`, null, baseApiUrl, 'GET')
}

