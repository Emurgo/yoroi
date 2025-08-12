import * as React from 'react'

import {useConnectionStatus} from '~/kernel/connection/ConnectionProvider'
import {ConnectionStatus} from '~/kernel/connection/types'

export const useIsOnline = (wallet: any): boolean => {
  const connectionStatus = useConnectionStatus()
  
  return React.useMemo(() => {
    return connectionStatus === ConnectionStatus.Online
  }, [connectionStatus])
}
