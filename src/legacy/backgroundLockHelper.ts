import {AppState} from 'react-native'
import BackgroundTimer from 'react-native-background-timer'

import {CONFIG} from './config'

let timeout

export const backgroundLockListener = (action: () => void) => {
  if (AppState.currentState === 'background') {
    timeout = BackgroundTimer.setTimeout(action, CONFIG.APP_LOCK_TIMEOUT)
  } else if (AppState.currentState === 'active') {
    BackgroundTimer.clearTimeout(timeout)
  }
}
