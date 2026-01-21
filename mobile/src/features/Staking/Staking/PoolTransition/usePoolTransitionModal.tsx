import {useSelectedWallet} from '@yoroi/wallet-manager'

import * as React from 'react'
import {useWindowDimensions} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useModal} from '~/ui/Modal/context/ModalContext'

import {PoolTransitionModal} from './PoolTransitionModal'
import {usePoolTransitionContext} from './PoolTransitionProvider'
import {usePoolTransition} from './usePoolTransition'

export const usePoolTransitionModal = (options?: {enabled?: boolean}) => {
  const enabled = options?.enabled ?? true
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
      enabled &&
      !shownWallets.includes(wallet.id) &&
      isPoolRetiring &&
      poolTransition !== null
    ) {
      openModal({
        title: strings.staking.title,
        content: (
          <PoolTransitionModal.Content poolTransition={poolTransition} />
        ),
        footer: <PoolTransitionModal.Footer onContinue={navigateToUpdate} />,
        height: modalHeight,
      })
      setShownWallets(() => [wallet.id, ...shownWallets])
    }
  }, [
    enabled,
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
