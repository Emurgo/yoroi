// @flow
import {AppState} from 'react-native'

import BackgroundTimer from 'react-native-background-timer'

import NavigationService from '.././NavigationService'
import {CONFIG} from '.././config'
import {ROOT_ROUTES} from '.././RoutesList'
import {closeWallet} from '.././actions.js'

let timeout
const onTimeout = () => {
  closeWallet()
  NavigationService.navigate(ROOT_ROUTES.LOGIN)
}

export const backgroundLockListener = () => {
  if (AppState.currentState === 'background') {
    timeout = BackgroundTimer.setTimeout(onTimeout, CONFIG.APP_LOCK_TIMEOUT)
  } else if (AppState.currentState === 'active') {
    BackgroundTimer.clearTimeout(timeout)
  }
}
