import * as React from 'react'

import {useModal} from '../../components'
import {useSelectedWallet} from '../../features/WalletManager/Context/SelectedWalletContext'
import {PoolTransitionModal} from './PoolTransitionModal'
import {usePoolTransitionContext} from './PoolTransitionProvider'
import {usePoolTransition, useStrings} from './usePoolTransition'

export const usePoolTransitionModal = () => {
  const {poolTransition, isPoolRetiring, isLoading, navigateToUpdate} = usePoolTransition()
  const wallet = useSelectedWallet()
  const [closedWallets] = usePoolTransitionContext()
  const {openModal} = useModal()
  const strings = useStrings()
  const modalHeight = 700

  React.useEffect(() => {
    if (!closedWallets.includes(wallet.id) && isPoolRetiring && poolTransition !== null) {
      openModal(
        strings.title,
        <PoolTransitionModal poolTransition={poolTransition} onContinue={navigateToUpdate} />,
        modalHeight,
      )
    }
  }, [
    closedWallets,
    isPoolRetiring,
    modalHeight,
    navigateToUpdate,
    openModal,
    poolTransition,
    strings.title,
    wallet.id,
  ])

  return {isLoading}
}
