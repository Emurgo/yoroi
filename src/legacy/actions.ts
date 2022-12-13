/* eslint-disable @typescript-eslint/no-explicit-any */
import 'react-intl'

import type {IntlShape} from 'react-intl'
import {Alert} from 'react-native'
import type {Dispatch} from 'redux'
import uuid from 'uuid'

import {getCrashReportsEnabled} from '../hooks'
import globalMessages, {errorMessages} from '../i18n/global-messages'
import {walletManager} from '../yoroi-wallets'
import type {AppSettingsKey} from './appSettings'
import {APP_SETTINGS_KEYS, readAppSettings, writeAppSettings} from './appSettings'
import assert from './assert'
import crashReporting from './crashReporting'
import {installationIdSelector} from './selectors'
import type {State} from './state'

export const setAppSettingField = (fieldName: AppSettingsKey, value: any) => async (dispatch: Dispatch<any>) => {
  await writeAppSettings(fieldName, value)
  dispatch({
    path: ['appSettings', fieldName],
    payload: value,
    type: 'SET_APP_SETTING_FIELD',
    reducer: (state: State, payload) => payload,
  })
}

const _setAppSettings = (appSettings) => ({
  path: ['appSettings'],
  payload: appSettings,
  type: 'SET_APP_SETTINGS',
  reducer: (state: State, payload) => payload,
})

export const reloadAppSettings = () => async (dispatch: Dispatch<any>) => {
  const appSettings = await readAppSettings()
  dispatch(_setAppSettings(appSettings))
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
  await dispatch(reloadAppSettings())
  await dispatch(initInstallationId())

  const crashReportsEnabled = await getCrashReportsEnabled()
  if (crashReportsEnabled) {
    crashReporting.setUserId(installationIdSelector(getState()))
    crashReporting.enable()
  }

  await walletManager.initialize()
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
