import * as React from 'react'

import {useAuth} from '../../context/AuthProvider'
import {EnableLoginWithPinScreen} from './EnableLoginWithPinScreen'

export const InitiatePinScreen = () => {
  const {loggedIn, changeAuthSetting} = useAuth()

  const handleDone = React.useCallback(() => {
    changeAuthSetting('pin')
    loggedIn()
  }, [changeAuthSetting, loggedIn])

  return <EnableLoginWithPinScreen onDone={handleDone} />
}
