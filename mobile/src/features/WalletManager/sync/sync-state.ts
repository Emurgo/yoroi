import {Chain} from '@yoroi/types'

import {YoroiWallet} from '~/wallets/cardano/types'

import {SyncWalletInfo} from '../common/types'

/**
 * Sync state for individual wallet
 */
export type SyncWalletState = {
  wallet: YoroiWallet
  info: SyncWalletInfo
  lastSyncTime: number
  errorCount: number
  nextRetryTime?: number
}

/**
 * Overall sync manager state
 */
export type SyncManagerState = {
  wallets: Map<YoroiWallet['id'], SyncWalletState>
  isActive: boolean
  lastSyncTime: number
  lastTxSubmissionTime?: number
  lastTxSubmissionWalletId?: YoroiWallet['id']
  lastUtxoCountBeforeSync?: number
  isFastPolling: boolean
  currentNetwork: Chain.SupportedNetworks
}

/**
 * Initial sync state
 */
export const createInitialSyncState = (
  network: Chain.SupportedNetworks,
): SyncManagerState => ({
  wallets: new Map(),
  isActive: false,
  lastSyncTime: 0,
  isFastPolling: false,
  currentNetwork: network,
})
