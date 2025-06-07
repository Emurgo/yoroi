import React from 'react'

import {LoadingOverlay} from '../../../ui/LoadingOverlay/LoadingOverlay'
import {useDisableAllEasyConfirmation} from '../hooks/useDisableAllEasyConfirmation'
import {CreatePinScreen} from './CreatePinScreen'

export const EnableLoginWithPinScreen = ({onDone}: {onDone: () => void}) => {
  const {disableAllEasyConfirmation, isLoading} = useDisableAllEasyConfirmation(
    {
      onSettled: onDone,
    },
  )

  return (
    <>
      <CreatePinScreen onDone={disableAllEasyConfirmation} />

      <LoadingOverlay isLoading={isLoading} />
    </>
  )
}
