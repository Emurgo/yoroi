// @flow
import {AppState, Alert} from 'react-native'
import uuid from 'uuid'

import {Logger} from './utils/logging'
import walletManager from './crypto/wallet'
import {mirrorTxHistory, setBackgroundSyncError} from './actions/history'
import {
  canFingerprintEncryptionBeEnabled,
  recreateAppSignInKeys,
} from './helpers/deviceSettings'
import l10n from './l10n'
import {backgroundLockListener} from './helpers/backgroundLockHelper'
import {encryptCustomPin} from './crypto/customPin'
import {
  readAppSettings,
  writeAppSettings,
  AppSettingsError,
  APP_SETTINGS_KEYS,
  type AppSettingsKey,
} from './helpers/appSettings'
import networkInfo from './utils/networkInfo'
import {
  appIdSelector,
  systemAuthSupportSelector,
  customPinHashSelector,
  languageSelector,
  tosSelector,
} from './selectors'

import {type Dispatch} from 'redux'
import {type State} from './state'
import NavigationService from './NavigationService'
import {ROOT_ROUTES, FIRST_RUN_ROUTES} from './RoutesList'

export const setAppSettingField = (fieldName: AppSettingsKey, value: any) => (
  dispatch: Dispatch<any>,
) => {
  writeAppSettings(fieldName, value)
  dispatch({
    path: ['appSettings', fieldName],
    payload: value,
    type: 'SET_APP_SETTING_FIELD',
    reducer: (state, payload) => payload,
  })
}

export const setSystemAuth = (enable: boolean) => (
  dispatch: Dispatch<any>,
  getState: any,
) => {
  const canBeDisabled = walletManager.canBiometricsSignInBeDisabled()
  if (!enable && !canBeDisabled) {
    Alert.alert(
      l10n.translations.SettingsScreen.systemAuthDisable.title,
      l10n.translations.SettingsScreen.systemAuthDisable.text,
      [
        {
          text: l10n.translations.SettingsScreen.systemAuthDisable.okButton,
        },
      ],
    )
    return
  }

  dispatch(setAppSettingField(APP_SETTINGS_KEYS.SYSTEM_AUTH_ENABLED, enable))

  const appId = appIdSelector(getState())
  if (appId) {
    recreateAppSignInKeys(appId)
  }
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
  dispatch(_setAppSettings(appSettings))
}

export const encryptAndStoreCustomPin = (pin: string) => async (
  dispatch: Dispatch<any>,
  getState: () => State,
) => {
  const state = getState()
  const appId = state.appSettings.appId
  if (!appId) {
    throw new AppSettingsError(APP_SETTINGS_KEYS.APP_ID)
  }
  const customPinHash = await encryptCustomPin(appId, pin)
  dispatch(setAppSettingField(APP_SETTINGS_KEYS.CUSTOM_PIN_HASH, customPinHash))
}

export const navigateFromSplash = () => (
  dispatch: Dispatch<any>,
  getState: any,
) => {
  // TODO(ppershing): here we should switch between
  // onboarding and normal wallet flow
  const state = getState()

  if (!languageSelector(state)) {
    NavigationService.navigate(ROOT_ROUTES.FIRST_RUN)
  } else if (!tosSelector(state)) {
    NavigationService.navigate(FIRST_RUN_ROUTES.ACCEPT_TERMS_OF_SERVICE)
  } else if (
    !systemAuthSupportSelector(state) &&
    !customPinHashSelector(state)
  ) {
    NavigationService.navigate(FIRST_RUN_ROUTES.CUSTOM_PIN)
  } else {
    NavigationService.navigate(ROOT_ROUTES.INDEX)
  }
}

export const notifyOfGeneralError = (errorToLog: string, exception: Object) => {
  Logger.error(errorToLog, exception)

  Alert.alert(
    l10n.translations.global.alerts.errorHeading,
    l10n.translations.global.alerts.generalErrorText,
  )
}

export const acceptAndSaveTos = () => (dispatch: Dispatch<any>) => {
  dispatch(setAppSettingField(APP_SETTINGS_KEYS.ACCEPTED_TOS, true))
}

const firstRunSetup = () => (dispatch: Dispatch<any>, getState: any) => {
  const appId = uuid.v4()
  dispatch(setAppSettingField(APP_SETTINGS_KEYS.APP_ID, appId))
}

export const closeWallet = () => async (dispatch: Dispatch<any>) => {
  await walletManager.closeWallet()
}

export const initApp = () => async (dispatch: Dispatch<any>, getState: any) => {
  await dispatch(reloadAppSettings())

  const onTimeoutAction = () => {
    closeWallet()
    dispatch(navigateFromSplash())
  }

  AppState.addEventListener('change', () => {
    backgroundLockListener(onTimeoutAction)
  })

  const state = getState()
  if (!appIdSelector(state)) {
    dispatch(firstRunSetup())
  }

  // prettier-ignore
  const hasEnrolledFingerprints =
    await canFingerprintEncryptionBeEnabled()

  dispatch(
    setAppSettingField(
      APP_SETTINGS_KEYS.HAS_FINGERPRINTS_ENROLLED,
      hasEnrolledFingerprints,
    ),
  )

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
  dispatch(updateWallets())
}

export const createWallet = (
  name: string,
  mnemonic: string,
  password: string,
) => async (dispatch: Dispatch<any>) => {
  await walletManager.createWallet(name, mnemonic, password)
  dispatch(updateWallets())
}

export const removeCurrentWallet = () => async (dispatch: Dispatch<any>) => {
  await walletManager.removeCurrentWallet()
  dispatch(updateWallets())
}
