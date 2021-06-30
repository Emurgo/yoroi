// @flow

import {AppState, Alert, Keyboard, Platform} from 'react-native'
import uuid from 'uuid'
import {type IntlShape} from 'react-intl'
import DeviceInfo from 'react-native-device-info'
import RNBootSplash from 'react-native-bootsplash'

import crashReporting from './helpers/crashReporting'
import globalMessages, {errorMessages} from './i18n/global-messages'
import {Logger} from './utils/logging'
import walletManager from './crypto/walletManager'
import {
  mirrorTxHistory,
  setBackgroundSyncError,
  updateHistory,
} from './actions/history'
import {changeAndSaveLanguage} from './actions/language'
import {clearUTXOs} from './actions/utxo'
import {clearAccountState} from './actions/account'
import {fetchTokenInfo} from './actions/tokenInfo'
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
  sendCrashReportsSelector,
  currentVersionSelector,
  isAppSetupCompleteSelector,
} from './selectors'
import assert from './utils/assert'
import KeyStore from './crypto/KeyStore'
import * as api from './api/shelley/api'
import {ISignRequest} from './crypto/ISignRequest'
import {CONFIG} from './config/config'
import {getCardanoNetworkConfigById} from './config/networks'

import {type Dispatch} from 'redux'
import type {State, ServerStatusCache} from './state'
import type {HWDeviceInfo} from './crypto/shelley/ledgerUtils'
import type {NetworkId, WalletImplementationId} from './config/types'

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

export const removeCustomPin = () => async (dispatch: Dispatch<any>) => {
  await dispatch(clearAppSettingField(APP_SETTINGS_KEYS.CUSTOM_PIN_HASH))
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

const _setServerStatus = (serverStatus: ServerStatusCache) => (
  dispatch: Dispatch<any>,
) =>
  dispatch({
    path: ['serverStatus'],
    payload: serverStatus,
    type: 'SET_SERVER_STATUS',
    reducer: (state, payload) => payload,
  })

export const initApp = () => async (dispatch: Dispatch<any>, getState: any) => {
  try {
    // check status of default network
    const backendConfig = getCardanoNetworkConfigById(
      CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
    ).BACKEND
    const status = await api.checkServerStatus(backendConfig)
    dispatch(
      _setServerStatus({
        isServerOk: status.isServerOk,
        isMaintenance: status.isMaintenance,
        serverTime: new Date(status.serverTime),
      }),
    )
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

  // prettier-ignore
  const canEnableBiometricEncryption =
    (await canBiometricEncryptionBeEnabled()) && !shouldNotEnableBiometricAuth

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

  RNBootSplash.hide({fade: true})
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
  walletManager.subscribeServerSync((status) =>
    dispatch(_setServerStatus(status)),
  )

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
  Keyboard.addListener('keyboardDidShow', () =>
    dispatch(setIsKeyboardOpen(true)),
  )
  Keyboard.addListener('keyboardDidHide', () =>
    dispatch(setIsKeyboardOpen(false)),
  )
}

export const generateNewReceiveAddress = () => async (
  _dispatch: Dispatch<any>,
) => {
  return await walletManager.generateNewUiReceiveAddress()
}

export const generateNewReceiveAddressIfNeeded = () => async (
  _dispatch: Dispatch<any>,
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
  networkId: NetworkId,
  implementationId: WalletImplementationId,
) => async (dispatch: Dispatch<any>) => {
  await walletManager.createWallet(
    name,
    mnemonic,
    password,
    networkId,
    implementationId,
  )
  dispatch(updateWallets())
}

export const createWalletWithBip44Account = (
  name: string,
  bip44AccountPublic: string,
  networkId: NetworkId,
  implementationId: WalletImplementationId,
  hwDeviceInfo: ?HWDeviceInfo,
  readOnly: boolean,
) => async (dispatch: Dispatch<any>) => {
  await walletManager.createWalletWithBip44Account(
    name,
    bip44AccountPublic,
    networkId,
    implementationId,
    hwDeviceInfo,
    readOnly,
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
  new Promise((resolve) => {
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
  dialog: {title: Object, message: Object},
  intl: ?IntlShape,
  msgOptions?: {message: string},
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
  intl: IntlShape,
): Promise<DialogButton> =>
  showDialog({
    // $FlowFixMe
    title: intl.formatMessage(dialog.title),
    // $FlowFixMe
    message: intl.formatMessage(dialog.message),
    // $FlowFixMe
    yesButton: intl.formatMessage(dialog.yesButton),
    // $FlowFixMe
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
  intl: ?IntlShape,
) => {
  Logger.error(`${message}: ${e.message}`, e)
  await showErrorDialog(errorMessages.generalError, intl, {message})
}

export const submitSignedTx = (signedTx: string) => async (
  dispatch: Dispatch<any>,
) => {
  Logger.info('submitting tx...')
  await walletManager.submitTransaction(signedTx)

  dispatch(updateHistory())
}

// note: eslint doesn't like polymorphic types
/* eslint-disable indent */
export const submitTransaction = <T>(
  signRequest: ISignRequest<T>,
  decryptedKey: string,
) => async (dispatch: Dispatch<any>) => {
  const {encodedTx} = await walletManager.signTx(signRequest, decryptedKey)
  Logger.info(
    'submitTransaction::encodedTx',
    Buffer.from(encodedTx).toString('hex'),
  )
  const signedTxBase64 = Buffer.from(encodedTx).toString('base64')
  await dispatch(submitSignedTx(signedTxBase64))
}
/* eslint-enable indent */

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
