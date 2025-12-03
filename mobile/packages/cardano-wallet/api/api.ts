import {
  AccountStateRequest,
  AccountStateResponse,
  TipStatusResponse,
  TxHistoryRequest,
  TxStatusRequest,
  TxStatusResponse,
} from '@yoroi/api'
import {StakePoolInfoRequest, StakePoolInfosAndHistories} from '@yoroi/staking'
import {Address, TransactionCborBase64, WalletTransaction} from '@yoroi/types'

import {cardanoWalletApiMaker} from '../../../../packages/api/cardano/api-maker'
import {WalletContext} from '../../../../packages/api/cardano/types'
import {getSpendingKey} from '../addressInfo/addressInfo'

// Create API instances per baseApiUrl - preferences are set at initialization
const apiInstances = new Map<string, ReturnType<typeof cardanoWalletApiMaker>>()

const getApi = (baseApiUrl: string) => {
  if (!apiInstances.has(baseApiUrl)) {
    apiInstances.set(
      baseApiUrl,
      cardanoWalletApiMaker({baseApiUrl, getSpendingKey}),
    )
  }
  return apiInstances.get(baseApiUrl)!
}

/**
 * Get tip status (best block information)
 * @param baseApiUrl - Base API URL (used to create/get API instance)
 */
export const getTipStatus = async (
  baseApiUrl: string,
): Promise<TipStatusResponse> => {
  return getApi(baseApiUrl).getTipStatus()
}

/**
 * Fetch new transaction history
 * @param request - Transaction history request
 * @param baseApiUrl - Base API URL (used to create/get API instance)
 * @param walletContext - Wallet context (required for backend-zero)
 */
export const fetchNewTxHistory = async (
  request: TxHistoryRequest,
  baseApiUrl: string,
  walletContext?: WalletContext,
): Promise<{isLast: boolean; transactions: Array<WalletTransaction>}> => {
  return getApi(baseApiUrl).fetchNewTxHistory(request, walletContext)
}

/**
 * Filter used addresses
 * @param addresses - Addresses to filter
 * @param baseApiUrl - Base API URL (used to create/get API instance)
 * @param walletContext - Wallet context (required for backend-zero)
 */
export const filterUsedAddresses = async (
  addresses: Address[],
  baseApiUrl: string,
  walletContext?: WalletContext,
): Promise<Address[]> => {
  return getApi(baseApiUrl).filterUsedAddresses(addresses, walletContext)
}

/**
 * Submit transaction
 * @param signedTx - Signed transaction CBOR (base64 encoded)
 * @param baseApiUrl - Base API URL (used to create/get API instance)
 */
export const submitTransaction = async (
  signedTx: TransactionCborBase64,
  baseApiUrl: string,
): Promise<void> => {
  return getApi(baseApiUrl).submitTransaction(signedTx)
}

/**
 * Get account state (rewards)
 * @param request - Account state request
 * @param baseApiUrl - Base API URL (used to create/get API instance)
 * @param walletContext - Wallet context (required for backend-zero)
 */
export const getAccountState = async (
  request: AccountStateRequest,
  baseApiUrl: string,
  walletContext?: WalletContext,
): Promise<AccountStateResponse> => {
  return getApi(baseApiUrl).getAccountState(request, walletContext)
}

/**
 * Bulk get account state
 * @param addresses - Addresses to query
 * @param baseApiUrl - Base API URL (used to create/get API instance)
 * @param walletContext - Wallet context (required for backend-zero)
 */
export const bulkGetAccountState = async (
  addresses: Address[],
  baseApiUrl: string,
  walletContext?: WalletContext,
): Promise<AccountStateResponse> => {
  return getApi(baseApiUrl).bulkGetAccountState(addresses, walletContext)
}

/**
 * Get pool info
 * @param request - Pool info request
 * @param baseApiUrl - Base API URL (used to create/get API instance)
 */
export const getPoolInfo = async (
  request: StakePoolInfoRequest,
  baseApiUrl: string,
): Promise<StakePoolInfosAndHistories> => {
  return getApi(baseApiUrl).getPoolInfo(request)
}

/**
 * Fetch transaction status
 * @param request - Transaction status request
 * @param baseApiUrl - Base API URL (used to create/get API instance)
 */
export const fetchTxStatus = async (
  request: TxStatusRequest,
  baseApiUrl: string,
): Promise<TxStatusResponse> => {
  return getApi(baseApiUrl).fetchTxStatus(request)
}

/**
 * Check server status (legacy only)
 * @param baseApiUrl - Base API URL (used to create/get API instance)
 */
export const checkServerStatus = async (
  baseApiUrl: string,
): Promise<{
  isServerOk: boolean
  serverTime: number
}> => {
  const api = getApi(baseApiUrl)
  if (!api.checkServerStatus) {
    throw new Error('checkServerStatus not available')
  }
  return api.checkServerStatus()
}

/**
 * Get fund info (legacy only)
 * @param baseApiUrl - Base API URL (used to create/get API instance)
 */
export const getFundInfo = async (
  baseApiUrl: string,
): Promise<{
  currentFund: {
    id: number
    registrationStart: string
    registrationEnd: string
    votingStart?: string
    votingEnd?: string
    votingPowerThreshold: string
  } | null
  nextFund: {
    id: number
    registrationStart: string
    registrationEnd: string
    votingStart?: string
    votingEnd?: string
    votingPowerThreshold: string
  } | null
}> => {
  const api = getApi(baseApiUrl)
  if (!api.getFundInfo) {
    throw new Error('getFundInfo not available')
  }
  return api.getFundInfo()
}
