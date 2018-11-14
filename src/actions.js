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

export const setEasyConfirmation = (enable: boolean) => ({
  path: ['wallet', 'isEasyConfirmationEnabled'],
  payload: enable,
  reducer: (state: State, value: boolean) => value,
  type: 'SET_EASY_CONFIRMATION',
})

const _updateWallets = (wallets) => ({
  path: ['wallets'],
  payload: wallets,
  reducer: (state, value) => value,
  type: 'UPDATE_WALLETS',
})

const updateWallets = () => (dispatch: Dispatch<any>) => {
  const wallets = walletManager.getWallets()
  dispatch(_updateWallets(wallets))
}

export const navigateFromSplash = () => (
  dispatch: Dispatch<any>,
  getState: any,
) => {
  // TODO(ppershing): here we should switch between
  // onboarding and normal wallet flow
  const state = getState()
  const doOnboarding = !state.languageCode

  if (doOnboarding) {
    NavigationService.navigate(ROOT_ROUTES.INIT)
  } else {
    NavigationService.navigate(ROOT_ROUTES.INDEX)
  }
}

export const initApp = () => async (dispatch: Dispatch<any>, getState: any) => {
  if (getState().isAppInitialized) {
    dispatch(navigateFromSplash())
    return
  }

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

  await dispatch(loadLanguage())
  await walletManager.initialize()
  await dispatch(updateWallets())

  dispatch({
    path: ['isAppInitialized'],
    payload: true,
    reducer: (state, value) => value,
    type: 'INITIALIZE_APP',
  })
  dispatch(navigateFromSplash())
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

export const changeWalletName = (newName: string) => async (
  dispatch: Dispatch<any>,
) => {
  await walletManager.rename(newName)
}

export const removeCurrentWallet = () => async (dispatch: Dispatch<any>) => {
  await walletManager.removeCurrentWallet()
  dispatch(updateWallets())
}
