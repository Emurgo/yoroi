import * as React from 'react'

import {useConnectionStatus} from '~/kernel/connection/ConnectionProvider'
import {ConnectionStatus} from '~/kernel/connection/types'

import {YoroiWallet} from '~/wallets/cardano/types'

export const useIsOnline = (_wallet: YoroiWallet): boolean => {
  const connectionStatus = useConnectionStatus()

  return React.useMemo(() => {
    return connectionStatus === ConnectionStatus.Online
  }, [connectionStatus])
}
