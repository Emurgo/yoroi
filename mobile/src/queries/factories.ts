import {Chain} from '@yoroi/types'

import {QueryKey} from '@tanstack/react-query'

/**
 * React Query Query Factories
 * Standardized query keys and factory functions for consistent cache management
 */

// ============================================================================
// Pool Queries
// ============================================================================

export const poolQueryKeys = {
  /**
   * Query key for pool list
   * @param walletId - Wallet ID
   * @param network - Network
   * @param searchQuery - Optional search query
   */
  list: (
    walletId: string,
    network: Chain.SupportedNetworks,
    searchQuery?: string,
  ): QueryKey => ['poolList', walletId, network, searchQuery?.trim() ?? ''],

  /**
   * Query key for a single pool info
   * @param poolId - Pool ID
   */
  info: (poolId: string): QueryKey => ['usePoolInfo', poolId],

  /**
   * Query key for pool list with pagination
   * @param walletId - Wallet ID
   * @param network - Network
   * @param searchQuery - Optional search query
   * @param pageParam - Page parameter for infinite queries
   */
  listInfinite: (
    walletId: string,
    network: Chain.SupportedNetworks,
    searchQuery?: string,
    pageParam?: number,
  ): QueryKey => [
    'poolList',
    walletId,
    network,
    searchQuery?.trim() ?? '',
    pageParam ?? 0,
  ],
}

// ============================================================================
// Governance/DRep Queries
// ============================================================================

export const governanceQueryKeys = {
  /**
   * Query key for DRep ID resolution
   * @param resolve - Resolve string (handle, address, etc.)
   * @param isMainnet - Whether mainnet
   */
  drepId: (resolve: string, isMainnet: boolean): QueryKey => [
    'useResolverDRepId',
    resolve,
    isMainnet,
  ],

  /**
   * Query key for staking key state
   * @param stakingKeyHash - Staking key hash
   */
  stakingKeyState: (stakingKeyHash: string): QueryKey => [
    'stakingKeyState',
    stakingKeyHash,
  ],

  /**
   * Query key for latest governance action
   * @param walletId - Wallet ID
   */
  latestAction: (walletId: string): QueryKey => [
    'latestGovernanceAction',
    walletId,
  ],

  /**
   * Query key for governance banner
   * @param walletId - Wallet ID
   * @param network - Network
   */
  banner: (
    walletId: string | undefined,
    network: Chain.SupportedNetworks,
  ): QueryKey => ['governanceBanner', walletId, network],
}

// ============================================================================
// Notification Queries
// ============================================================================

export const notificationQueryKeys = {
  all: ['notifications'] as const,

  /**
   * Query key for received notification events
   */
  events: (): QueryKey => ['receivedNotificationEvents'],
}

// ============================================================================
// Token Queries
// ============================================================================

export const tokenQueryKeys = {
  /**
   * Query key for token info
   * @param tokenId - Token ID
   */
  info: (tokenId: string): QueryKey => ['tokenInfo', tokenId],

  /**
   * Query key for multiple token infos
   * @param walletId - Wallet ID
   * @param networkId - Network ID
   * @param tokenIds - Array of token IDs
   */
  infos: (
    walletId: string,
    networkId: Chain.SupportedNetworks,
    tokenIds: ReadonlyArray<string>,
  ): QueryKey => [
    'useTokenInfos',
    walletId,
    networkId,
    // Sort token IDs for stable key
    [...tokenIds].sort(),
  ],

  /**
   * Query key for token chart data
   * @param tokenId - Token ID
   * @param timeInterval - Time interval
   * @param currency - Currency
   */
  chart: (
    tokenId: string,
    timeInterval: string,
    currency?: string,
  ): QueryKey => ['useGetPortfolioTokenChart', tokenId, timeInterval, currency],
}

// ============================================================================
// Transaction Queries
// ============================================================================

export const transactionQueryKeys = {
  /**
   * Query key for pending transactions
   * @param walletId - Wallet ID
   */
  pending: (walletId: string): QueryKey => [walletId, 'pendingTxs'],

  /**
   * Query key for transaction history
   * @param walletId - Wallet ID
   * @param network - Network
   */
  history: (walletId: string, network: Chain.SupportedNetworks): QueryKey => [
    'txHistory',
    walletId,
    network,
  ],

  /**
   * Query key for transaction details
   * @param walletId - Wallet ID
   * @param txId - Transaction ID
   */
  details: (walletId: string, txId: string): QueryKey => [
    'txDetails',
    walletId,
    txId,
  ],
}

// ============================================================================
// Portfolio Queries
// ============================================================================

export const portfolioQueryKeys = {
  /**
   * Query key for portfolio token activity
   * @param network - Network
   * @param tokenIds - Array of token IDs
   * @param timeWindow - Time window (24h, 7d, 30d)
   */
  tokenActivity: (
    network: Chain.SupportedNetworks,
    tokenIds: ReadonlyArray<string>,
    timeWindow: string,
  ): QueryKey => [
    'portfolioTokenActivity',
    network,
    [...tokenIds].sort(),
    timeWindow,
  ],

  /**
   * Base query key for portfolio token activity provider
   */
  tokenActivityBase: (): QueryKey => ['usePortfolioTokenActivity'],
}

// ============================================================================
// Transaction/UTXO Queries
// ============================================================================

export const utxoQueryKeys = {
  /**
   * Query key for UTXO list
   * @param walletId - Wallet ID
   */
  list: (walletId: string): QueryKey => ['utxoList', walletId],
}

// ============================================================================
// Legal/Disclaimer Queries
// ============================================================================

export const legalQueryKeys = {
  /**
   * Query key for disclaimer state
   * @param name - Disclaimer name
   */
  disclaimer: (name: string): QueryKey => ['disclaimer', name],
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Helper to create query keys with consistent formatting
 */
export const createQueryKey = {
  /**
   * Create a query key with a base prefix
   */
  withPrefix: <T extends unknown[]>(prefix: string, ...args: T): QueryKey => [
    prefix,
    ...args,
  ],

  /**
   * Create a query key for a specific entity
   */
  entity: <T extends unknown[]>(
    entityType: string,
    entityId: string,
    ...args: T
  ): QueryKey => [entityType, entityId, ...args],
}
