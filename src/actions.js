// @flow
import {Alert, AsyncStorage} from 'react-native'

import l10n from './l10n'
import {Logger} from './utils/logging'
import walletManager from './crypto/wallet'
import {mirrorTxHistory, setBackgroundSyncError} from './actions/history'
import {
  isFingerprintEncryptionHardwareSupported,
  canFingerprintEncryptionBeEnabled,
  isSystemAuthSupported,
} from './helpers/deviceSettings'
import networkInfo from './utils/networkInfo'

import {type Dispatch} from 'redux'
import {type State} from './state'

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

export const initAppIfNeeded = () => async (
  dispatch: Dispatch<any>,
  getState: () => State,
) => {
  const state = getState()
  if (!state.isAppInitialized) {
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

    dispatch({
      path: ['isAppInitialized'],
      payload: true,
      reducer: (state, value) => value,
      type: 'INITIALIZE_APP',
    })
  }
}

const _changeLanguage = (languageCode) => (dispatch, getState) => {
  l10n.setLanguage(languageCode)
  dispatch({
    path: ['languageCode'],
    payload: languageCode,
    reducer: (state, languageCode) => languageCode,
    type: 'CHANGE_LANGUAGE',
  })
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

const LOCAL_STORAGE_KEY_LANG = 'lang'

export const changeLanguage = (languageCode: string) => async (
  dispatch: Dispatch<any>,
) => {
  try {
    await AsyncStorage.setItem(LOCAL_STORAGE_KEY_LANG, languageCode)
    dispatch(_changeLanguage(languageCode))
  } catch (e) {
    Logger.error(
      'Saving language to AsyncStorage failed. UI language left intact',
      e,
    )
    // TODO add missing localization
    Alert.alert('Error', 'Could not set selected language.')
  }
}

export const loadLanguage = () => async (dispatch: Dispatch<any>) => {
  try {
    const languageCode = await AsyncStorage.getItem(LOCAL_STORAGE_KEY_LANG)
    if (languageCode) {
      dispatch(_changeLanguage(languageCode))
    }
  } catch (e) {
    Logger.error(
      'Loading language from AsyncStorage failed. UI language left intact.',
      e,
    )
  }
}
