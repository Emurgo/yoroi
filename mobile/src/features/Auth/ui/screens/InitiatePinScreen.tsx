import * as React from 'react'

import {useAuth} from '../../context/AuthProvider'
import {EnableLoginWithPinScreen} from './EnableLoginWithPinScreen'

export const InitiatePinScreen = () => {
  const {loggedIn, changeAuthSetting} = useAuth()

  const handleDone = () => {
    changeAuthSetting('pin')
    loggedIn()
  }

  return <EnableLoginWithPinScreen onDone={handleDone} />
}
