import React from 'react'

import {LoadingOverlay} from '../../components/LoadingOverlay/LoadingOverlay'
import {useDisableAllEasyConfirmation} from './common/useDisableAllEasyConfirmation'
import {CreatePinScreen} from './CreatePinScreen'

export const EnableLoginWithPin = ({onDone}: {onDone: () => void}) => {
  const {disableAllEasyConfirmation, isLoading} = useDisableAllEasyConfirmation({
    onSettled: onDone,
  })

  return (
    <>
      <CreatePinScreen onDone={disableAllEasyConfirmation} />

      <LoadingOverlay loading={isLoading} />
    </>
  )
}
