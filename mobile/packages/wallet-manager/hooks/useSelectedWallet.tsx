import {YoroiWallet} from '@yoroi/cardano-wallet'
import {Wallet} from '@yoroi/types'

import {freeze} from 'immer'
import * as React from 'react'

import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'

import {useWalletManager} from '../context/WalletManagerProvider'
import {useSelectWalletModal} from '../ui/modals/SelectWalletModal'

type UseSelectedWalletReturn = {
  readonly wallet: YoroiWallet
  readonly meta: Wallet.Meta
}

/**
 * Returns the selected wallet and meta.
 *
 * If no wallet is selected, a non-dismissible modal is shown to force wallet selection.
 * Components wrapped in WithWalletOpened can safely assume this will never return null,
 * as WithWalletOpened prevents rendering until a wallet is selected.
 *
 * Components using this hook directly (outside WithWalletOpened) should handle the
 * null case by returning early or showing a loading state.
 */
export const useSelectedWallet = (): UseSelectedWalletReturn => {
  const {
    selected: {wallet, meta},
  } = useWalletManager()
  const {openSelectWalletModal} = useSelectWalletModal()
  const walletNavigation = useWalletNavigation()
  const [hasShownModal, setHasShownModal] = React.useState(false)

  // Show modal if wallet is not selected (only once per mount)
  React.useEffect(() => {
    if (!wallet || !meta) {
      if (!hasShownModal) {
        setHasShownModal(true)
        openSelectWalletModal({
          onSelect: () => {
            setHasShownModal(false)
            // Wallet will be selected, component will re-render
          },
          onCancel: () => {
            setHasShownModal(false)
            // Navigate to wallet selection screen if user cancels
            walletNavigation.resetToWalletSelection()
          },
        })
      }
    } else {
      setHasShownModal(false)
    }
  }, [wallet, meta, hasShownModal, openSelectWalletModal, walletNavigation])

  return React.useMemo(() => {
    if (!wallet || !meta) {
      // Modal is shown and non-dismissible, so user must select a wallet
      // Component will re-render when wallet is selected
      // Type assertion is safe: WithWalletOpened prevents rendering until wallet is selected
      // For components outside WithWalletOpened, they should handle null case explicitly
      return null as unknown as UseSelectedWalletReturn
    }

    return freeze({wallet, meta} as const)
  }, [meta, wallet])
}
