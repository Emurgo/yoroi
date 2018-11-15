// @flow
import {Logger} from './utils/logging'
import walletManager from './crypto/wallet'
import {mirrorTxHistory, setBackgroundSyncError} from './actions/history'
import {
  isFingerprintEncryptionHardwareSupported,
  canFingerprintEncryptionBeEnabled,
  isSystemAuthSupported,
} from './helpers/deviceSettings'
import networkInfo from './utils/networkInfo'
import {loadLanguage} from './actions/language'

import {type Dispatch} from 'redux'
import {type State} from './state'
import NavigationService from './NavigationService'
import {ROOT_ROUTES} from './RoutesList'

export const updateFingerprintsIndicators = (
  indicator: string,
  value: boolean,
) => (dispatch: Dispatch<any>) => {
  dispatch({
    path: ['auth', indicator],
    payload: value,
    reducer: (state, value) => value,
    type: 'UPDATE_FINGERPRINT_HW_INDICATORS',
  })
}

export const setSystemAuth = (enable: boolean) => ({
  path: ['auth', 'isSystemAuthEnabled'],
  payload: enable,
  reducer: (state: State, value: boolean) => value,
  type: 'SET_SYSTEM_AUTH',
})

export const initApp = () => async (dispatch: Dispatch<any>) => {
  const [
    isFingerprintHwSupported,
    canFingerprintAuthBeEnabled,
    canSystemAuthBeEnabled,
  ] = await Promise.all([
    isFingerprintEncryptionHardwareSupported(),
    canFingerprintEncryptionBeEnabled(),
    isSystemAuthSupported(),
  ])

  if (
    (isFingerprintHwSupported && canFingerprintAuthBeEnabled) ||
    canSystemAuthBeEnabled
  ) {
    dispatch(setSystemAuth(true))
  } else {
    // handle setting up of custom pin
  }

  const language = await dispatch(loadLanguage())

  dispatch({
    path: ['isAppInitialized'],
    payload: true,
    reducer: (state, value) => value,
    type: 'INITIALIZE_APP',
  })
  // TODO(ppershing): here we should switch between
  // onboarding and normal wallet flow
  const doOnboarding = !language
  if (doOnboarding) {
    NavigationService.navigate(ROOT_ROUTES.INIT)
  } else {
    NavigationService.navigate(ROOT_ROUTES.INDEX)
  }
}

const _setOnline = (isOnline: boolean) => (dispatch, getState) => {
  const state = getState()
  if (state.isOnline === isOnline) return // avoid useless state updates
  dispatch({
    type: 'Set isOnline',
    path: ['isOnline'],
    payload: isOnline,
    reducer: (state, payload) => payload,
  })
}

export const setupHooks = () => (dispatch: Dispatch<any>) => {
  Logger.debug('setting up isOnline callback')
  networkInfo.subscribe(({isOnline}) => dispatch(_setOnline(isOnline)))
  dispatch(_setOnline(networkInfo.getConnectionInfo().isOnline))

  Logger.debug('setting wallet manager hook')
  walletManager.subscribe(() => dispatch(mirrorTxHistory()))
  walletManager.subscribeBackgroundSyncError((err) =>
    dispatch(setBackgroundSyncError(err)),
  )
}

export const generateNewReceiveAddress = () => async (
  dispatch: Dispatch<any>,
) => {
  return await walletManager.generateNewUiReceiveAddress()
}

export const generateNewReceiveAddressIfNeeded = () => async (
  dispatch: Dispatch<any>,
) => {
  return await walletManager.generateNewUiReceiveAddressIfNeeded()
}
