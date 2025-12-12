import {YoroiWallet} from '@yoroi/cardano-wallet'

import * as React from 'react'

/**
 * Connection status type - should be provided by the app
 */
export type ConnectionStatus = 'online' | 'offline' | 'connecting'

/**
 * Hook to check if wallet is online
 * @param wallet - The wallet instance (currently unused but kept for API compatibility)
 * @param connectionStatus - Current connection status from the app
 */
export const useIsOnline = (
  _wallet: YoroiWallet,
  connectionStatus: ConnectionStatus,
): boolean => {
  return React.useMemo(() => {
    return connectionStatus === 'online'
  }, [connectionStatus])
}
