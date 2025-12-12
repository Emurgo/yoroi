import {YoroiWallet} from '@yoroi/cardano-wallet'

import * as React from 'react'

// @ts-expect-error - App-specific import, not available in package context
import {useConnectionStatus} from '~/kernel/connection/ConnectionProvider'
// @ts-expect-error - App-specific import, not available in package context
import {ConnectionStatus} from '~/kernel/connection/types'

export const useIsOnline = (_wallet: YoroiWallet): boolean => {
  const connectionStatus = useConnectionStatus()

  return React.useMemo(() => {
    return connectionStatus === ConnectionStatus.Online
  }, [connectionStatus])
}
