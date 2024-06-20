import * as React from 'react'
import {useWindowDimensions} from 'react-native'

import {useModal} from '../../../components'
import {useSelectedWallet} from '../../../features/WalletManager/common/hooks/useSelectedWallet'
import {PoolTransitionModal} from './PoolTransitionModal'
import {usePoolTransitionContext} from './PoolTransitionProvider'
import {usePoolTransition, useStrings} from './usePoolTransition'

export const usePoolTransitionModal = () => {
  const {poolTransition, isPoolRetiring, isLoading, navigateToUpdate} = usePoolTransition()
  const {wallet} = useSelectedWallet()
  const [shownWallets, setShownWallets] = usePoolTransitionContext()
  const {openModal} = useModal()
  const strings = useStrings()
  const screenHeight = useWindowDimensions().height
  const modalHeight = screenHeight * 0.8

  React.useEffect(() => {
    if (!shownWallets.includes(wallet.id) && isPoolRetiring && poolTransition !== null) {
      openModal(
        strings.title,
        <PoolTransitionModal poolTransition={poolTransition} onContinue={navigateToUpdate} />,
        modalHeight,
      )
      setShownWallets(() => [wallet.id, ...shownWallets])
    }
  }, [
    shownWallets,
    isPoolRetiring,
    modalHeight,
    navigateToUpdate,
    openModal,
    poolTransition,
    strings.title,
    wallet.id,
    setShownWallets,
  ])

  return {isLoading}
}
