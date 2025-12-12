import * as React from 'react'

import {useDisableAllEasyConfirmation} from '../../hooks/useDisableAllEasyConfirmation'
import {CreatePinScreen} from './CreatePinScreen'

export const EnableLoginWithPinScreen = ({onDone}: {onDone: () => void}) => {
  // Use useRef to store the latest onDone callback to prevent infinite re-renders
  const onDoneRef = React.useRef(onDone)
  React.useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  const onSettledCallback = React.useCallback(() => {
    onDoneRef.current()
  }, [])

  const {disableAllEasyConfirmation} = useDisableAllEasyConfirmation({
    onSettled: onSettledCallback,
  })

  const handlePinDone = React.useCallback(
    (_pin: string) => {
      disableAllEasyConfirmation()
    },
    [disableAllEasyConfirmation],
  )

  return <CreatePinScreen onDone={handlePinDone} />
}
