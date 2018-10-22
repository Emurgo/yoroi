// @flow
import {Alert, AsyncStorage} from 'react-native'

import api from './api'
import l10n from './l10n'
import walletManager from './crypto/wallet'
import {Logger} from './utils/logging'

import {type Dispatch} from 'redux'

const _updateTransactions = (rawTransactions) => ({
  type: 'Update transactions',
  path: ['transactions', 'data'],
  payload: rawTransactions,
  reducer: (state, payload) => payload,
})

const _startFetch = () => ({
  type: 'Fetch transaction history',
  path: ['transactions', 'isFetching'],
  payload: null,
  reducer: (state, payload) => true,
})

const _endFetch = () => ({
  type: 'Finished fetching transaction history',
  path: ['transactions', 'isFetching'],
  payload: null,
  reducer: (state, payload) => false,
})

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

export const setupApiOnlineTracking = () => (dispatch: Dispatch<any>) => {
  Logger.debug('setting up api isOnline callback')
  api.setIsOnlineCallback((isOnline) => dispatch(_setOnline(isOnline)))
}

export const updateHistory = () => async (dispatch: Dispatch<any>) => {
  // TODO(ppershing): abort previous request if still fetching
  dispatch(_startFetch())
  try {
    walletManager.__initTestWalletIfNeeded()
    const response = await walletManager.doFullSync()
    dispatch(_updateTransactions(response))
  } catch (e) {
    Logger.error('Update history error', e)
  } finally {
    dispatch(_endFetch())
  }
}

const LOCAL_STORAGE_KEY_LANG = 'lang'

export const changeLanguage = (languageCode: string) => async (dispatch: Dispatch<any>) => {
  try {
    await AsyncStorage.setItem(LOCAL_STORAGE_KEY_LANG, languageCode)
    dispatch(_changeLanguage(languageCode))
  } catch (e) {
    Logger.error('Saving language to AsyncStorage failed. UI language left intact', e)
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
    Logger.error('Loading language from AsyncStorage failed. UI language left intact.', e)
  }
}
