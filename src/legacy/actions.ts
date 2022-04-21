/* eslint-disable @typescript-eslint/no-explicit-any */
import 'react-intl'
import 'redux'

import type {IntlShape} from 'react-intl'
import {Alert, AppState, Keyboard, Platform} from 'react-native'
import RNBootSplash from 'react-native-bootsplash'
import type {Dispatch} from 'redux'
import uuid from 'uuid'

import globalMessages, {errorMessages} from '../i18n/global-messages'
import {Logger} from '../legacy/logging'
import {ServerStatus, walletManager} from '../yoroi-wallets'
import {clearAccountState} from './account'
import * as api from './api'
import type {AppSettingsKey} from './appSettings'
import {APP_SETTINGS_KEYS, AppSettingsError, readAppSettings, removeAppSettings, writeAppSettings} from './appSettings'
import assert from './assert'
import {backgroundLockListener} from './backgroundLockHelper'
import {CONFIG, isNightly} from './config'
import crashReporting from './crashReporting'
import {encryptCustomPin} from './customPin'
import {canBiometricEncryptionBeEnabled, recreateAppSignInKeys, removeAppSignInKeys} from './deviceSettings'
import {mirrorTxHistory, setBackgroundSyncError, updateHistory} from './history'
import {ISignRequest} from './ISignRequest'
import KeyStore from './KeyStore'
import networkInfo from './networkInfo'
import {getCardanoNetworkConfigById} from './networks'
import {
  canEnableBiometricSelector,
  installationIdSelector,
  isAppSetupCompleteSelector,
  isSystemAuthEnabledSelector,
  sendCrashReportsSelector,
} from './selectors'
import type {State} from './state'
import {fetchTokenInfo} from './tokenInfo'
import {clearUTXOs} from './utxo'

const updateCrashlytics = (fieldName: AppSettingsKey, value: any) => {
  const handlers = {
    [APP_SETTINGS_KEYS.LANG]: () => crashReporting.setStringValue('language_code', value),
    [APP_SETTINGS_KEYS.BIOMETRIC_HW_SUPPORT]: () => crashReporting.setBoolValue('biometric_hw_support', value),
    [APP_SETTINGS_KEYS.CAN_ENABLE_BIOMETRIC_ENCRYPTION]: () =>
      crashReporting.setBoolValue('can_enable_biometric_encryption', value),
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
    reducer: (state, payload) => payload,
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
    reducer: (state, payload) => payload,
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
  reducer: (state, value) => value,
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
  reducer: (state, payload) => payload,
})

const reloadAppSettings = () => async (dispatch: Dispatch<any>) => {
  const appSettings = await readAppSettings()
  Object.entries(appSettings).forEach(([key, value]) => {
    updateCrashlytics(key, value)
  })
  dispatch(_setAppSettings(appSettings))
}

export const encryptAndStoreCustomPin = (pin: string) => async (dispatch: Dispatch<any>, getState: () => State) => {
  const state = getState()
  const installationId = state.appSettings.installationId

  if (installationId == null) {
    throw new AppSettingsError(APP_SETTINGS_KEYS.INSTALLATION_ID)
  }

  const customPinHash = await encryptCustomPin(installationId, pin)
  await dispatch(setAppSettingField(APP_SETTINGS_KEYS.CUSTOM_PIN_HASH, customPinHash))
}
export const removeCustomPin = () => async (dispatch: Dispatch<any>) => {
  await dispatch(clearAppSettingField(APP_SETTINGS_KEYS.CUSTOM_PIN_HASH))
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

export const closeWallet = () => async (_dispatch: Dispatch<any>) => {
  await walletManager.closeWallet()
}
// note(v-almonacid): authentication occurs after entering pin or biometrics,
// it does not mean we opened a wallet
export const signin = () => (dispatch: Dispatch<any>) => {
  dispatch({
    path: ['isAuthenticated'],
    payload: true,
    type: 'SIGN_IN',
    reducer: (state, payload) => payload,
  })
}
export const signout = () => (dispatch: Dispatch<any>) => {
  dispatch({
    path: ['isAuthenticated'],
    payload: false,
    type: 'SIGN_OUT',
    reducer: (state, payload) => payload,
  })
}
// logout closes the active wallet and signout
export const logout = () => async (dispatch: Dispatch<any>) => {
  await closeWallet()
  dispatch(signout())
}

const _setServerStatus = (serverStatus: ServerStatus) => (dispatch: Dispatch<any>) =>
  dispatch({
    path: ['serverStatus'],
    payload: serverStatus,
    type: 'SET_SERVER_STATUS',
    reducer: (state, payload) => payload,
  })

export const initApp = () => async (dispatch: Dispatch<any>, getState: any) => {
  try {
    // check status of default network
    const backendConfig = getCardanoNetworkConfigById(CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID).BACKEND
    const status = await api.checkServerStatus(backendConfig)
    dispatch(
      _setServerStatus({
        isServerOk: status.isServerOk,
        isMaintenance: status.isMaintenance,
        serverTime: new Date(status.serverTime as any),
      }),
    )
  } catch (e) {
    Logger.warn('actions::initApp could not retrieve server status', e)
  }

  if (isNightly()) {
    dispatch(setAppSettingField(APP_SETTINGS_KEYS.SEND_CRASH_REPORTS, true))
  }

  await dispatch(reloadAppSettings())

  await dispatch(reloadAppSettings())
  const installationId = (await dispatch(initInstallationId())) as unknown as string
  const state = getState()

  if (sendCrashReportsSelector(getState())) {
    crashReporting.enable()
    // TODO(ppershing): just update crashlytic variables here
    await dispatch(reloadAppSettings())
    crashReporting.setUserId(installationIdSelector(getState()))
  }

  /**
   * note(v-almonacid): temporary disable biometric auth for Android >= 10
   * (SDK >= 29), as our java auth module is currently outdated, causing
   * issues in some devices
   */
  let shouldNotEnableBiometricAuth = false

  if (
    !isAppSetupCompleteSelector(state) &&
    Platform.OS === 'android' &&
    CONFIG.ANDROID_BIO_AUTH_EXCLUDED_SDK.includes(Platform.Version)
  ) {
    shouldNotEnableBiometricAuth = true
  }

  Logger.debug('shouldDisableBiometricAuth:', shouldNotEnableBiometricAuth)
  Logger.debug('isSystemAuthEnabled:', isSystemAuthEnabledSelector(state))
  const canEnableBiometricEncryption = (await canBiometricEncryptionBeEnabled()) && !shouldNotEnableBiometricAuth
  await dispatch(setAppSettingField(APP_SETTINGS_KEYS.CAN_ENABLE_BIOMETRIC_ENCRYPTION, canEnableBiometricEncryption))
  await walletManager.initialize()
  await dispatch(updateWallets())

  if (canEnableBiometricEncryption && isSystemAuthEnabledSelector(state)) {
    // On android 6 signin keys can get invalidated
    // (e. g. when you change fingerprint),
    // if that happens we want to regenerate them.
    // As for the invalidate PIN case -> that should only
    // happen when user removes PIN and re-creates it, but that should
    // not be possible without first removing biometrics?
    // So the biometrics key would be invalidated first.
    // Also there is no way we know of to check if the key is valid
    // in SYSTEM_PIN case without user typing the correct PIN.
    const isKeyValid = await KeyStore.isKeyValid(installationId, 'BIOMETRICS')

    if (!isKeyValid) {
      await recreateAppSignInKeys(installationId)
    }
  }

  dispatch({
    path: ['isAppInitialized'],
    payload: true,
    reducer: (state, value) => value,
    type: 'INITIALIZE_APP',
  })
  RNBootSplash.hide({
    fade: true,
  })
}

export const checkBiometricStatus = () => async (dispatch: Dispatch<any>, getState: any) => {
  const state = getState()
  const shouldNotEnableBiometricAuth =
    !isAppSetupCompleteSelector(state) &&
    Platform.OS === 'android' &&
    CONFIG.ANDROID_BIO_AUTH_EXCLUDED_SDK.includes(Platform.Version)
  const currentCanEnableBiometricEncryption = canEnableBiometricSelector(state)
  const canEnableBiometricEncryption = (await canBiometricEncryptionBeEnabled()) && !shouldNotEnableBiometricAuth

  const biometricWasTurnedOff = !canEnableBiometricEncryption && currentCanEnableBiometricEncryption
  Logger.debug('willResetBiometric:', biometricWasTurnedOff)
  if (biometricWasTurnedOff) {
    await dispatch(setAppSettingField(APP_SETTINGS_KEYS.CAN_ENABLE_BIOMETRIC_ENCRYPTION, canEnableBiometricEncryption))
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

const setIsKeyboardOpen = (isOpen) => ({
  type: 'Set isKeyboardOpen',
  path: ['isKeyboardOpen'],
  payload: isOpen,
  reducer: (state, payload) => payload,
})

export const setupHooks = () => (dispatch: Dispatch<any>) => {
  Logger.debug('setting up isOnline callback')
  networkInfo.subscribe(({isOnline}) => dispatch(_setOnline(isOnline)))
  dispatch(_setOnline(networkInfo.getConnectionInfo().isOnline))
  Logger.debug('setting wallet manager hook')
  walletManager.subscribe(() => dispatch(mirrorTxHistory()))
  walletManager.subscribeBackgroundSyncError((err: any) => dispatch(setBackgroundSyncError(err)))
  walletManager.subscribeServerSync((status) => dispatch(_setServerStatus(status)))
  walletManager.subscribeOnOpen(() => dispatch(fetchTokenInfo()))
  walletManager.subscribeOnClose(() => dispatch(clearUTXOs()))
  walletManager.subscribeOnClose(() => dispatch(clearAccountState()))
  walletManager.subscribeOnTxHistoryUpdate(() => dispatch(fetchTokenInfo()))
  Logger.debug('setting up app lock')

  const onTimeoutAction = () => {
    dispatch(logout())
  }

  AppState.addEventListener('change', () => {
    backgroundLockListener(onTimeoutAction)
  })
  Logger.debug('setting up keyboard manager')
  Keyboard.addListener('keyboardDidShow', () => dispatch(setIsKeyboardOpen(true)))
  Keyboard.addListener('keyboardDidHide', () => dispatch(setIsKeyboardOpen(false)))
}
export const generateNewReceiveAddress = () => async (_dispatch: Dispatch<any>) => {
  return await walletManager.generateNewUiReceiveAddress()
}
export const generateNewReceiveAddressIfNeeded = () => async (_dispatch: Dispatch<any>) => {
  return await walletManager.generateNewUiReceiveAddressIfNeeded()
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
export const setSystemAuth = (enable: boolean) => async (dispatch: Dispatch<any>, getState: any) => {
  await dispatch(setAppSettingField(APP_SETTINGS_KEYS.SYSTEM_AUTH_ENABLED, enable))
  const installationId = installationIdSelector(getState())

  if (installationId == null) {
    throw new Error('Installation id is not defined')
  }

  if (enable) {
    await recreateAppSignInKeys(installationId)
    await dispatch(removeCustomPin())
  } else {
    await removeAppSignInKeys(installationId)
  }
}
export const handleGeneralError = async (message: string, e: Error, intl: IntlShape | null | undefined) => {
  Logger.error(`${message}: ${e.message}`, e)
  await showErrorDialog(errorMessages.generalError, intl, {
    message,
  })
}
export const submitSignedTx = (signedTx: string) => async (dispatch: Dispatch<any>) => {
  Logger.info('submitting tx...')
  await walletManager.submitTransaction(signedTx)
  dispatch(updateHistory())
}
// note: eslint doesn't like polymorphic types
export const submitTransaction =
  <T>(signRequest: ISignRequest<T>, decryptedKey: string) =>
  async (dispatch: Dispatch<any>) => {
    const {encodedTx} = await walletManager.signTx(signRequest, decryptedKey)
    Logger.info('submitTransaction::encodedTx', Buffer.from(encodedTx).toString('hex'))
    const signedTxBase64 = Buffer.from(encodedTx).toString('base64')
    await dispatch(submitSignedTx(signedTxBase64))
  }
export const checkForFlawedWallets = () => (dispatch: Dispatch<any>) => {
  let isFlawed = false
  Logger.debug('actions::checkForFlawedWallets:: checking wallet...')

  try {
    isFlawed = walletManager.checkForFlawedWallets()
    Logger.debug('actions::checkForFlawedWallets::isFlawed', isFlawed)
    dispatch({
      path: ['isFlawedWallet'],
      payload: isFlawed,
      reducer: (state, isFlawed) => isFlawed,
      type: 'SET_FLAWED_WALLET',
    })
  } catch (e) {
    Logger.warn('actions::checkForFlawedWallets error', e)
  }
}
