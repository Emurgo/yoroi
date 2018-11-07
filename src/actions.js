// @flow
import {Alert, AsyncStorage} from 'react-native'

import api from './api'
import l10n from './l10n'
import {Logger} from './utils/logging'
import walletManager from './crypto/wallet'
import {mirrorTxHistory} from './actions/history'

import {type Dispatch} from 'redux'

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

// Temporary
export const initializeWallet = () => async (
  dispatch: Dispatch<any>,
  getState: any,
) => {
  const mnemonic = [
    'dry balcony arctic what garbage sort',
    'cart shine egg lamp manual bottom',
    'slide assault bus',
  ].join(' ')
  await walletManager.createWallet('uuid', 'My Wallet', mnemonic, 'password')
}

export const setupHooks = () => (dispatch: Dispatch<any>) => {
  Logger.debug('setting up api isOnline callback')
  api.setIsOnlineCallback((isOnline) => dispatch(_setOnline(isOnline)))
  Logger.debug('setting wallet manager hook')
  walletManager.subscribe(() => dispatch(mirrorTxHistory()))

  dispatch(initializeWallet())
}

export const generateNewReceiveAddress = () => (dispatch: Dispatch<any>) => {
  walletManager.generateNewUiReceiveAddress()
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
