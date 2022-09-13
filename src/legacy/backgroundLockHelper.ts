import {CONFIG} from '@yoroi-wallets'
import {AppState} from 'react-native'
import BackgroundTimer from 'react-native-background-timer'

let timeout

export const backgroundLockListener = (action: () => void) => {
  if (AppState.currentState === 'background') {
    timeout = BackgroundTimer.setTimeout(action, CONFIG.APP_LOCK_TIMEOUT)
  } else if (AppState.currentState === 'active') {
    BackgroundTimer.clearTimeout(timeout)
  }
}
