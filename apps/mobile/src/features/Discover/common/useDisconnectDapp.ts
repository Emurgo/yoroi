import {useDappConnector} from '@yoroi/dapp-connector'
import * as React from 'react'

import {useMetrics} from '~/kernel/metrics/metricsManager'
import type {DAppItem} from './helpers'
import {useInvalidateConnectedDapps} from './useDAppsConnected'

export const useDisconnectDapp = () => {
  const {manager} = useDappConnector()
  const {track} = useMetrics()
  const invalidateConnectedDapps = useInvalidateConnectedDapps()

  return React.useCallback(
    async (dApp: DAppItem) => {
      track.discoverConnectedBottomSheetDisconnectClicked()
      const connections = dApp.origins.map((origin) => ({dappOrigin: origin}))
      await manager.removeConnections(connections)
      await invalidateConnectedDapps()
    },
    [manager, track, invalidateConnectedDapps],
  )
}
