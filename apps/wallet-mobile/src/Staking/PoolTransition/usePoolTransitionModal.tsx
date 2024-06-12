import * as React from 'react'

import {useModal} from '../../components'
import {PoolTransitionModal} from './PoolTransitionModal'
import {usePoolTransition, useStrings} from './usePoolTransition'

export const usePoolTransitionModal = () => {
  const {poolTransition, isPoolRetiring, isLoading, navigateToUpdate} = usePoolTransition()
  const {openModal} = useModal()
  const [closed, setClosed] = React.useState(false)
  const strings = useStrings()
  const modalHeight = 700

  React.useEffect(() => {
    if (!closed && isPoolRetiring && poolTransition !== null) {
      openModal(
        strings.title,
        <PoolTransitionModal
          poolTransition={poolTransition}
          onContinue={navigateToUpdate}
          onClose={() => setClosed(true)}
        />,
        modalHeight,
      )
    }
  }, [closed, isPoolRetiring, modalHeight, navigateToUpdate, openModal, poolTransition, strings.title])

  return {isLoading}
}
