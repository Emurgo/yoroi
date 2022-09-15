/* eslint-disable @typescript-eslint/no-explicit-any */
import 'react-intl'
import 'redux'

import type {IntlShape} from 'react-intl'
import {Alert, Keyboard} from 'react-native'
import type {Dispatch} from 'redux'
import uuid from 'uuid'

import globalMessages, {errorMessages} from '../i18n/global-messages'
import {Logger} from '../legacy/logging'
import {walletManager} from '../yoroi-wallets'
import type {AppSettingsKey} from './appSettings'
import {APP_SETTINGS_KEYS, readAppSettings, removeAppSettings, writeAppSettings} from './appSettings'
import assert from './assert'
import {isNightly} from './config'
import crashReporting from './crashReporting'
import {mirrorTxHistory, setBackgroundSyncError} from './history'
import {installationIdSelector, sendCrashReportsSelector} from './selectors'
import type {State} from './state'

const updateCrashlytics = (fieldName: AppSettingsKey, value: any) => {
  const handlers = {
    [APP_SETTINGS_KEYS.LANG]: () => crashReporting.setStringValue('language_code', value),
  }
  const handler = handlers[fieldName] || null
  handler && handler()
}

export const setAppSettingField = (fieldName: AppSettingsKey, value: any) => async (dispatch: Dispatch<any>) => {
  await writeAppSettings(fieldName, value)
  dispatch({
    path: ['appSettings', fieldName],
    payload: value,
    type: 'SET_APP_SETTING_FIELD',
    reducer: (state: State, payload) => payload,
  })
  updateCrashlytics(fieldName, value)
}
export const clearAppSettingField = (fieldName: AppSettingsKey) => async (dispatch: Dispatch<any>) => {
  await removeAppSettings(fieldName)
  updateCrashlytics(fieldName, null)
  dispatch({
    path: ['appSettings', fieldName],
    payload: null,
    type: 'REMOVE_APP_SETTING_FIELD',
    reducer: (state: State, payload) => payload,
  })
}
export const setEasyConfirmation = (enable: boolean) => ({
  path: ['wallet', 'isEasyConfirmationEnabled'],
  payload: enable,
  reducer: (state: State, value: boolean) => value,
  type: 'SET_EASY_CONFIRMATION',
})

const _updateWallets = (wallets) => ({
  path: ['wallets'],
  payload: wallets,
  reducer: (state: State, value) => value,
  type: 'UPDATE_WALLETS',
})

export const updateWallets = () => (dispatch: Dispatch<any>) => {
  const wallets = walletManager.getWallets()
  dispatch(_updateWallets(wallets))
}

const _setAppSettings = (appSettings) => ({
  path: ['appSettings'],
  payload: appSettings,
  type: 'SET_APP_SETTINGS',
  reducer: (state: State, payload) => payload,
})

export const reloadAppSettings = () => async (dispatch: Dispatch<any>) => {
  const appSettings = await readAppSettings()
  Object.entries(appSettings).forEach(([key, value]) => {
    updateCrashlytics(key, value)
  })
  dispatch(_setAppSettings(appSettings))
}

export const acceptAndSaveTos = () => async (dispatch: Dispatch<any>) => {
  await dispatch(setAppSettingField(APP_SETTINGS_KEYS.ACCEPTED_TOS, true))
}

const initInstallationId =
  () =>
  async (dispatch: Dispatch<any>, getState: any): Promise<string> => {
    const installationId = installationIdSelector(getState())

    if (installationId != null) {
      return installationId
    }

    const newInstallationId = uuid.v4()
    await dispatch(setAppSettingField(APP_SETTINGS_KEYS.INSTALLATION_ID, newInstallationId))
    return newInstallationId
  }

export const initApp = () => async (dispatch: Dispatch<any>, getState: any) => {
  if (isNightly()) {
    dispatch(setAppSettingField(APP_SETTINGS_KEYS.SEND_CRASH_REPORTS, true))
  }

  await dispatch(reloadAppSettings())
  await dispatch(initInstallationId())

  if (sendCrashReportsSelector(getState())) {
    crashReporting.enable()
    // TODO(ppershing): just update crashlytic variables here
    await dispatch(reloadAppSettings())
    crashReporting.setUserId(installationIdSelector(getState()))
  }

  await walletManager.initialize()
  await dispatch(updateWallets())

  dispatch({
    path: ['isAppInitialized'],
    payload: true,
    reducer: (state: State, value) => value,
    type: 'INITIALIZE_APP',
  })
}

const setIsKeyboardOpen = (isOpen) => ({
  type: 'Set isKeyboardOpen',
  path: ['isKeyboardOpen'],
  payload: isOpen,
  reducer: (state: State, payload) => payload,
})

export const setupHooks = () => (dispatch: Dispatch<any>) => {
  Logger.debug('setting up isOnline callback')
  Logger.debug('setting wallet manager hook')
  walletManager.subscribe(() => dispatch(mirrorTxHistory()))
  walletManager.subscribeBackgroundSyncError((err: any) => dispatch(setBackgroundSyncError(err)))
  Logger.debug('setting up app lock')

  Logger.debug('setting up keyboard manager')
  Keyboard.addListener('keyboardDidShow', () => dispatch(setIsKeyboardOpen(true)))
  Keyboard.addListener('keyboardDidHide', () => dispatch(setIsKeyboardOpen(false)))
}
export const generateNewReceiveAddress = () => async (_dispatch: Dispatch<any>) => {
  return walletManager.generateNewUiReceiveAddress()
}
export const generateNewReceiveAddressIfNeeded = () => async (_dispatch: Dispatch<any>) => {
  return walletManager.generateNewUiReceiveAddressIfNeeded()
}
type DialogOptions = {
  title: string
  message: string
  yesButton?: string
  noButton?: string
}
export const DIALOG_BUTTONS = {
  YES: 'Yes',
  NO: 'No',
}
type DialogButton = typeof DIALOG_BUTTONS[keyof typeof DIALOG_BUTTONS]

const showDialog = (translations: DialogOptions): Promise<DialogButton> =>
  new Promise((resolve) => {
    const {title, message, yesButton, noButton} = translations
    const buttons: Array<any> = []
    assert.assert(yesButton, 'Yes button should be provided')

    if (noButton != null) {
      buttons.push({
        text: noButton,
        onPress: () => resolve(DIALOG_BUTTONS.NO),
      })
    }

    buttons.push({
      text: yesButton,
      onPress: () => resolve(DIALOG_BUTTONS.YES),
    })
    Alert.alert(title, message, buttons, {
      cancelable: false,
    })
  })

export const showErrorDialog = (
  dialog: {
    title: Record<string, any>
    message: Record<string, any>
  },
  intl: IntlShape | null | undefined,
  msgOptions?: {
    message: string
  },
): Promise<DialogButton> => {
  let title, message, yesButton

  if (intl != null) {
    title = intl.formatMessage(dialog.title)
    message = intl.formatMessage(dialog.message, msgOptions)
    yesButton = intl.formatMessage(globalMessages.ok)
  } else {
    // in this case the function was called without providing the IntlShape
    // object, so only an english dialog will be displayed
    title = dialog.title.defaultMessage

    // seems impossible to pass eslint check using a ternary operator here
    if (msgOptions != null && 'message' in msgOptions) {
      message = dialog.message.defaultMessage.replace(new RegExp('{message}', 'gi'), msgOptions.message)
    } else {
      message = 'unknown error'
    }

    yesButton = globalMessages.ok.defaultMessage
  }

  return showDialog({
    title,
    message,
    yesButton,
  })
}
export const showConfirmationDialog = (dialog: any | DialogOptions, intl: IntlShape): Promise<DialogButton> =>
  showDialog({
    title: intl.formatMessage(dialog.title),
    message: intl.formatMessage(dialog.message),
    yesButton: intl.formatMessage(dialog.yesButton),
    noButton: intl.formatMessage(dialog.noButton),
  })

export const handleGeneralError = async (message: string, intl: IntlShape) => {
  await showErrorDialog(errorMessages.generalError, intl, {message})
}
