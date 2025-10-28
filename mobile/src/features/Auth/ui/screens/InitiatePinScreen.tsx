import * as React from 'react'

import {usePageViewTracking} from '~/features/Analytics/hooks/usePageViewTracking'

import {useAuth} from '../../context/AuthProvider'
import {EnableLoginWithPinScreen} from './EnableLoginWithPinScreen'

export const InitiatePinScreen = () => {
  const {loggedIn, changeAuthSetting} = useAuth()

  usePageViewTracking('Onboarding Pin Code Page Viewed')

  const handleDone = () => {
    changeAuthSetting('pin')
    loggedIn()
  }

  return <EnableLoginWithPinScreen onDone={handleDone} />
}
