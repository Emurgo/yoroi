/**
 * LEGACY API FALLBACK IMPLEMENTATIONS
 *
 * This file contains fallback implementations that use legacy API when:
 * 1. Backend-zero request fails
 * 2. Wallet context is not available
 * 3. Backend-zero endpoint is unavailable
 *
 * These are fallback-only methods - they should NOT be called directly.
 * Use the main API methods in api.ts which will automatically fall back to these.
 *
 * TODO: Remove this file when all methods are fully migrated to backend-zero.
 */
import {
  AccountStateRequest,
  AccountStateResponse,
  RawTransaction,
  TxHistoryRequest,
} from '~/wallets/types/other'

import {fetchDefault} from '../fetch'

type Addresses = Array<string>
const limitApiRecords = 50

/**
 * FALLBACK ONLY: POST /account/state
 *
 * Legacy account state endpoint.
 * Used as fallback when backend-zero wallet registration fails or context unavailable.
 *
 * DO NOT CALL DIRECTLY - Use getAccountState() from api.ts instead.
 */
export const getAccountStateLegacy = (
  request: AccountStateRequest,
  baseApiUrl: string,
): Promise<AccountStateResponse> => {
  return fetchDefault('account/state', request, baseApiUrl)
}

/**
 * FALLBACK ONLY: POST /v2/txs/history
 *
 * Legacy transaction history endpoint.
 * Used as fallback when backend-zero wallet registration fails or context unavailable.
 *
 * DO NOT CALL DIRECTLY - Use fetchNewTxHistory() from api.ts instead.
 */
export const fetchNewTxHistoryLegacy = async (
  request: TxHistoryRequest,
  baseApiUrl: string,
): Promise<{isLast: boolean; transactions: Array<RawTransaction>}> => {
  const transactions = await fetchDefault<Array<RawTransaction>>(
    'v2/txs/history',
    request,
    baseApiUrl,
  )

  return {
    transactions,
    isLast: transactions.length < limitApiRecords,
  }
}

/**
 * FALLBACK ONLY: POST /v2/addresses/filterUsed
 *
 * Legacy address filtering endpoint.
 * Used as fallback when backend-zero wallet registration fails or context unavailable.
 *
 * DO NOT CALL DIRECTLY - Use filterUsedAddresses() from api.ts instead.
 */
export const filterUsedAddressesLegacy = async (
  addresses: Addresses,
  baseApiUrl: string,
): Promise<Addresses> => {
  const copy = [...addresses]
  const used = await fetchDefault<Addresses>(
    'v2/addresses/filterUsed',
    {addresses: copy},
    baseApiUrl,
  )
  // We need to do this so that we keep original order of addresses
  return copy.filter((addr) => used.includes(addr))
}
