import React from 'react'

import {useDisableAllEasyConfirmation} from '../hooks/useDisableAllEasyConfirmation'
import {CreatePinScreen} from './CreatePinScreen'

export const EnableLoginWithPinScreen = ({onDone}: {onDone: () => void}) => {
  const {disableAllEasyConfirmation} = useDisableAllEasyConfirmation({
    onSettled: onDone,
  })

  return <CreatePinScreen onDone={disableAllEasyConfirmation} />
}
