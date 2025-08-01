import * as React from 'react'
import {useWindowDimensions} from 'react-native'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useModal} from '~/ui/Modal/ModalContext'
import {
  PoolTransitionModal,
  PoolTransitionModalActions,
} from './PoolTransitionModal'
import {usePoolTransitionContext} from './PoolTransitionProvider'
import {usePoolTransition} from './usePoolTransition'
import {useStrings} from '~/kernel/i18n/useStrings'

export const usePoolTransitionModal = () => {
  const {poolTransition, isPoolRetiring, isLoading, navigateToUpdate} =
    usePoolTransition()
  const {wallet} = useSelectedWallet()
  const [shownWallets, setShownWallets] = usePoolTransitionContext()
  const {openModal} = useModal()
  const strings = useStrings()
  const screenHeight = useWindowDimensions().height
  const modalHeight = screenHeight * 0.8

  React.useEffect(() => {
    if (
      !shownWallets.includes(wallet.id) &&
      isPoolRetiring &&
      poolTransition !== null
    ) {
      openModal({
        title: strings.staking.title,
        content: <PoolTransitionModal poolTransition={poolTransition} />,
        footer: <PoolTransitionModalActions onContinue={navigateToUpdate} />,
        height: modalHeight,
      })
      setShownWallets(() => [wallet.id, ...shownWallets])
    }
  }, [
    shownWallets,
    isPoolRetiring,
    modalHeight,
    navigateToUpdate,
    openModal,
    poolTransition,
    strings.staking.title,
    wallet.id,
    setShownWallets,
  ])

  return {isLoading}
}
