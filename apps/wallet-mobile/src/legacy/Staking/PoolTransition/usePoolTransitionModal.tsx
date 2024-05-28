import * as React from 'react'

import {useModal} from '../../../components'
import {PoolTransitionModal} from './PoolTransitionModal'
import {usePoolTransition, useStrings} from './usePoolTransition'

export const usePoolTransitionModal = () => {
  const {poolTransition, isPoolRetiring, isLoading, navigateToUpdate} = usePoolTransition()
  const {openModal} = useModal()
  const strings = useStrings()
  const modalHeight = 700

  React.useEffect(() => {
    if (isPoolRetiring && poolTransition !== null) {
      openModal(
        strings.title,
        <PoolTransitionModal poolTransition={poolTransition} onContinue={navigateToUpdate} />,
        modalHeight,
      )
    }
  }, [isPoolRetiring, modalHeight, navigateToUpdate, openModal, poolTransition, strings.title])

  return {isLoading}
}
