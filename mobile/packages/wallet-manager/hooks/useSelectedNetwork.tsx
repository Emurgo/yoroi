import {freeze} from 'immer'

import {useWalletManagerSelector} from '../context/WalletManagerProvider'

/**
 * Hook to get the selected network and network manager.
 * Uses selector to prevent unnecessary re-renders when other context values change.
 */
export const useSelectedNetwork = () => {
  return useWalletManagerSelector((ctx) => {
    const {network, networkManager} = ctx.selected
    return freeze({
      network,
      networkManager,
    })
  })
}
