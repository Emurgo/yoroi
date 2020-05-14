// @flow

import {AppState, Alert, Keyboard} from 'react-native'
import uuid from 'uuid'
import SplashScreen from 'react-native-splash-screen'
import {intlShape} from 'react-intl'
import DeviceInfo from 'react-native-device-info'

import crashReporting from './helpers/crashReporting'
import globalMessages, {errorMessages} from './i18n/global-messages'
import {Logger} from './utils/logging'
import walletManager from './crypto/wallet'
import {
  mirrorTxHistory,
  setBackgroundSyncError,
  updateHistory,
} from './actions/history'
import {changeAndSaveLanguage} from './actions/language'
import {
  canBiometricEncryptionBeEnabled,
  recreateAppSignInKeys,
  removeAppSignInKeys,
} from './helpers/deviceSettings'

import {backgroundLockListener} from './helpers/backgroundLockHelper'
import {encryptCustomPin} from './crypto/customPin'
import {
  readAppSettings,
  writeAppSettings,
  removeAppSettings,
  AppSettingsError,
  APP_SETTINGS_KEYS,
  type AppSettingsKey,
} from './helpers/appSettings'
import networkInfo from './utils/networkInfo'
import {
  installationIdSelector,
  isSystemAuthEnabledSelector,
  customPinHashSelector,
  languageSelector,
  tosSelector,
  sendCrashReportsSelector,
  currentVersionSelector,
  isMaintenanceSelector,
} from './selectors'
import assert from './utils/assert'
import NavigationService from './NavigationService'
import {ROOT_ROUTES} from './RoutesList'
import KeyStore from './crypto/KeyStore'
import api from './api'

import {type Dispatch} from 'redux'
import {type State} from './state'
import type {PreparedTransactionData} from './types/HistoryTransaction'
import type {HWDeviceInfo} from './crypto/byron/ledgerUtils'

const updateCrashlytics = (fieldName: AppSettingsKey, value: any) => {
  const handlers = {
    [APP_SETTINGS_KEYS.LANG]: () =>
      crashReporting.setStringValue('language_code', value),
    [APP_SETTINGS_KEYS.BIOMETRIC_HW_SUPPORT]: () =>
      crashReporting.setBoolValue('biometric_hw_support', value),
    [APP_SETTINGS_KEYS.CAN_ENABLE_BIOMETRIC_ENCRYPTION]: () =>
      crashReporting.setBoolValue('can_enable_biometric_encryption', value),
  }

  // $FlowFixMe flow does not like undefined access but we are dealing with it
  const handler = handlers[fieldName] || null
  handler && handler()
}

export const setAppSettingField = (
  fieldName: AppSettingsKey,
  value: any,
) => async (dispatch: Dispatch<any>) => {
  await writeAppSettings(fieldName, value)

  dispatch({
    path: ['appSettings', fieldName],
    payload: value,
    type: 'SET_APP_SETTING_FIELD',
    reducer: (state, payload) => payload,
  })
  updateCrashlytics(fieldName, value)
}

export const clearAppSettingField = (fieldName: AppSettingsKey) => async (
  dispatch: Dispatch<any>,
) => {
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

const updateWallets = () => (dispatch: Dispatch<any>) => {
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
  if (appSettings.languageCode) {
    dispatch(changeAndSaveLanguage(appSettings.languageCode))
  }
}

export const encryptAndStoreCustomPin = (pin: string) => async (
  dispatch: Dispatch<any>,
  getState: () => State,
) => {
  const state = getState()
  const installationId = state.appSettings.installationId
  if (installationId == null) {
    throw new AppSettingsError(APP_SETTINGS_KEYS.INSTALLATION_ID)
  }

  const customPinHash = await encryptCustomPin(installationId, pin)
  await dispatch(
    setAppSettingField(APP_SETTINGS_KEYS.CUSTOM_PIN_HASH, customPinHash),
  )
}

export const removeCustomPin = () => async (
  dispatch: Dispatch<any>,
  getState: () => State,
) => {
  await dispatch(clearAppSettingField(APP_SETTINGS_KEYS.CUSTOM_PIN_HASH))
}

export const navigateFromSplash = () => (
  dispatch: Dispatch<any>,
  getState: any,
) => {
  // TODO(ppershing): here we should switch between
  // onboarding and normal wallet flow
  const state = getState()

  let route

  if (isMaintenanceSelector(state)) {
    route = ROOT_ROUTES.MAINTENANCE
  } else if (
    !languageSelector(state) ||
    !tosSelector(state) ||
    (!isSystemAuthEnabledSelector(state) && !customPinHashSelector(state))
  ) {
    route = ROOT_ROUTES.FIRST_RUN
  } else {
    // TODO: change to login in prod
    route = ROOT_ROUTES.INIT
  }

  // cool-user: Fixes app crashing, as Android back
  // button remounts the App component other solution is:
  // eslint-disable-next-line
  // https://github.com/facebook/react-native/issues/13775#issuecomment-319673305
  try {
    NavigationService.navigate(route)
  } catch (e) {
    Logger.warn('Could not navigate from splash screen')
  }
}

export const acceptAndSaveTos = () => async (dispatch: Dispatch<any>) => {
  await dispatch(setAppSettingField(APP_SETTINGS_KEYS.ACCEPTED_TOS, true))
}

const initInstallationId = () => async (
  dispatch: Dispatch<any>,
  getState: any,
): Promise<string> => {
  let installationId = installationIdSelector(getState())
  if (installationId != null) {
    return installationId
  }

  installationId = uuid.v4()

  await dispatch(
    setAppSettingField(APP_SETTINGS_KEYS.INSTALLATION_ID, installationId),
  )

  return installationId
}

export const updateVersion = () => async (
  dispatch: Dispatch<any>,
  getState: any,
): Promise<string> => {
  let currentVersion = currentVersionSelector(getState())
  Logger.debug('current version from state', currentVersion)
  if (currentVersion != null && currentVersion === DeviceInfo.getVersion()) {
    return currentVersion
  }

  currentVersion = DeviceInfo.getVersion()

  await dispatch(
    setAppSettingField(APP_SETTINGS_KEYS.CURRENT_VERSION, currentVersion),
  )
  Logger.debug('updated version', currentVersion)
  return currentVersion
}

export const closeWallet = () => async (dispatch: Dispatch<any>) => {
  await walletManager.closeWallet()
}

export const logout = () => async (dispatch: Dispatch<any>) => {
  await closeWallet()

  await dispatch(navigateFromSplash())
}

export const initApp = () => async (dispatch: Dispatch<any>, getState: any) => {

  try {
    const status = await api.checkServerStatus()
    dispatch({
      path: ['isMaintenance'],
      payload: status.isMaintenance != null ? status.isMaintenance : false,
      type: 'SET_IS_MAINTENANCE',
      reducer: (state, payload) => payload,
    })
  } catch (e) {
    Logger.warn('actions::initApp could not retrieve server status', e)
  }

  await dispatch(reloadAppSettings())

  const installationId = await dispatch(initInstallationId())
  const state = getState()

  if (sendCrashReportsSelector(getState())) {
    crashReporting.enable()
    // TODO(ppershing): just update crashlytic variables here
    await dispatch(reloadAppSettings())
  }

  crashReporting.setUserId(installationIdSelector(getState()))

  // prettier-ignore
  const canEnableBiometricEncryption =
    await canBiometricEncryptionBeEnabled()

  await dispatch(
    setAppSettingField(
      APP_SETTINGS_KEYS.CAN_ENABLE_BIOMETRIC_ENCRYPTION,
      canEnableBiometricEncryption,
    ),
  )

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
  dispatch(navigateFromSplash())
  SplashScreen.hide()
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
  walletManager.subscribeBackgroundSyncError((err) =>
    dispatch(setBackgroundSyncError(err)),
  )

  Logger.debug('setting up app lock')
  const onTimeoutAction = () => {
    dispatch(logout())
  }

  AppState.addEventListener('change', () => {
    backgroundLockListener(onTimeoutAction)
  })

  Logger.debug('setting up keyboard manager')
  Keyboard.addListener('keyboardDidShow', () =>
    dispatch(setIsKeyboardOpen(true)),
  )
  Keyboard.addListener('keyboardDidHide', () =>
    dispatch(setIsKeyboardOpen(false)),
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
  dispatch(updateWallets())
}

export const createWallet = (
  name: string,
  mnemonic: string,
  password: string,
  isShelley?: boolean = false,
) => async (dispatch: Dispatch<any>) => {
  await walletManager.createWallet(name, mnemonic, password, isShelley)
  dispatch(updateWallets())
}

export const createWalletWithBip44Account = (
  name: string,
  bip44AccountPublic: string,
  hwDeviceInfo: ?HWDeviceInfo,
  isShelley?: boolean = false,
) => async (dispatch: Dispatch<any>) => {
  await walletManager.createWalletWithBip44Account(
    name,
    bip44AccountPublic,
    hwDeviceInfo,
    isShelley,
  )
  dispatch(updateWallets())
}

export const removeCurrentWallet = () => async (dispatch: Dispatch<any>) => {
  await walletManager.removeCurrentWallet()
  dispatch(updateWallets())
}

type DialogOptions = {|
  title: string,
  message: string,
  yesButton?: string,
  noButton?: string,
|}

export const DIALOG_BUTTONS = Object.freeze({
  YES: 'Yes',
  NO: 'No',
})

type DialogButton = $Values<typeof DIALOG_BUTTONS>

const showDialog = (translations: DialogOptions): Promise<DialogButton> =>
  new Promise((resolve, reject) => {
    const {title, message, yesButton, noButton} = translations
    const buttons = []

    assert.assert(yesButton, 'Yes button should be provided')

    if (noButton != null) {
      buttons.push({
        text: noButton,
        onPress: () => resolve(DIALOG_BUTTONS.NO),
      })
    }

    buttons.push({text: yesButton, onPress: () => resolve(DIALOG_BUTTONS.YES)})

    Alert.alert(title, message, buttons, {cancelable: false})
  })

export const showErrorDialog = (
  dialog: Object,
  intl: ?intlShape,
  msgOptions?: Object,
): Promise<DialogButton> => {
  let title, message, yesButton
  if (intl != null) {
    title = intl.formatMessage(dialog.title)
    message = intl.formatMessage(dialog.message, msgOptions)
    yesButton = intl.formatMessage(globalMessages.ok)
  } else {
    // in this case the function was called without providing the intlShape
    // object, so only an english dialog will be displayed
    title = dialog.title.defaultMessage
    // seems impossible to pass eslint check using a ternary operator here
    if (msgOptions != null && 'message' in msgOptions) {
      message = dialog.message.defaultMessage.replace(
        new RegExp('{message}', 'gi'),
        msgOptions.message,
      )
    } else {
      message = 'unknown error'
    }
    yesButton = globalMessages.ok.defaultMessage
  }
  return showDialog({title, message, yesButton})
}

export const showConfirmationDialog = (
  dialog: DialogOptions,
  intl: intlShape,
): Promise<DialogButton> =>
  showDialog({
    title: intl.formatMessage(dialog.title),
    message: intl.formatMessage(dialog.message),
    yesButton: intl.formatMessage(dialog.yesButton),
    noButton: intl.formatMessage(dialog.noButton),
  })

export const setSystemAuth = (enable: boolean) => async (
  dispatch: Dispatch<any>,
  getState: any,
) => {
  const canBeDisabled = walletManager.canBiometricsSignInBeDisabled()

  if (!enable && !canBeDisabled) {
    throw new Error(
      'Can not disable system auth without disabling easy confirmation.',
    )
  }

  await dispatch(
    setAppSettingField(APP_SETTINGS_KEYS.SYSTEM_AUTH_ENABLED, enable),
  )

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

export const handleGeneralError = async (
  message: string,
  e: Error,
  intl: ?intlShape,
) => {
  Logger.error(`${message}: ${e.message}`, e)
  await showErrorDialog(errorMessages.generalError, intl, {message})
  crashReporting.crash()
}

export const submitSignedTx = (signedTx: string) => async (
  dispatch: Dispatch<any>,
) => {
  Logger.info('submitting tx...')
  await walletManager.submitTransaction(signedTx)

  // note(v-almonacid): tx history sync for shelley is not implemented yet,
  // but this action is required to update the wallet state
  dispatch(updateHistory())
}

export const submitTransaction = (
  decryptedKey: string,
  transactionData: PreparedTransactionData,
) => async (dispatch: Dispatch<any>) => {
  const signedTx = await walletManager.signTx(transactionData, decryptedKey)
  dispatch(submitSignedTx(signedTx))
}

export const submitShelleyTx = (encodedTx: Uint8Array) => (
  dispatch: Dispatch<any>,
) => {
  const signedTx64 = Buffer.from(encodedTx).toString('base64')
  dispatch(submitSignedTx(signedTx64))
}

export const checkForFlawedWallets = () => async (dispatch: Dispatch<any>) => {
  let isFlawed = false
  Logger.debug('actions::checkForFlawedWallets:: checking wallet...')
  try {
    isFlawed = await walletManager.checkForFlawedWallets()
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

const _saveHW = (hwDeviceInfo) => ({
  path: ['wallet', 'hwDeviceInfo'],
  payload: hwDeviceInfo,
  reducer: (state, value) => value,
  type: 'SAVE_HW',
})

export const saveHW = (hwDeviceInfo: HWDeviceInfo) => (
  dispatch: Dispatch<any>,
) => {
  dispatch(_saveHW(hwDeviceInfo))
}
