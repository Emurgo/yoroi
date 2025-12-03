import {YoroiWallet} from '@yoroi/cardano-wallet'
import {Wallet} from '@yoroi/types'

import {freeze} from 'immer'
import * as React from 'react'

import {useWalletManager} from '../context/WalletManagerProvider'

type UseSelectedWalletReturn = {
  readonly wallet: YoroiWallet
  readonly meta: Wallet.Meta
}

/**
 * Returns the selected wallet and meta.
 *
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

  return React.useMemo(() => {
    if (!wallet || !meta) {
      // Type assertion is safe: WithWalletOpened prevents rendering until wallet is selected
      // For components outside WithWalletOpened, they should handle null case explicitly
      return null as unknown as UseSelectedWalletReturn
    }

    return freeze({wallet, meta} as const)
  }, [meta, wallet])
}
