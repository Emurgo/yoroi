import {useDappConnector} from '@yoroi/dapp-connector'

import * as React from 'react'

import {useMetrics} from '~/kernel/metrics/metricsManager'

import {useBrowser} from './BrowserProvider'
import type {DAppItem} from './helpers'
import {getTabIndexesByOrigins} from './helpers'
import {useInvalidateConnectedDapps} from './useDAppsConnected'

export const useDisconnectDapp = () => {
  const {manager} = useDappConnector()
  const {track} = useMetrics()
  const invalidateConnectedDapps = useInvalidateConnectedDapps()
  const {
    sendDisconnectToOrigins,
    tabs,
    removeTab,
    tabActiveIndex,
    setTabActive,
  } = useBrowser()

  return React.useCallback(
    async (dApp: DAppItem) => {
      track.discoverConnectedBottomSheetDisconnectClicked()

      const tabIndexesToClose = getTabIndexesByOrigins(tabs, dApp.origins)

      // First send disconnect notification to WebViews
      sendDisconnectToOrigins(dApp.origins)

      // Close tabs before removing connections to ensure proper cleanup
      tabIndexesToClose
        .sort((a: number, b: number) => b - a)
        .forEach((tabIndex: number) => {
          if (tabIndex <= tabActiveIndex) {
            setTabActive(Math.max(0, tabActiveIndex - 1))
          }
          removeTab(tabIndex)
        })

      // Then remove connections from storage
      const connections = dApp.origins.map((origin) => ({dappOrigin: origin}))
      await manager.removeConnections(connections)

      await invalidateConnectedDapps()
    },
    [
      manager,
      track,
      invalidateConnectedDapps,
      sendDisconnectToOrigins,
      tabs,
      removeTab,
      tabActiveIndex,
      setTabActive,
    ],
  )
}
