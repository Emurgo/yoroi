// @flow
import {AppState, Alert} from 'react-native'
import uuid from 'uuid'

import {Logger} from './utils/logging'
import walletManager from './crypto/wallet'
import {mirrorTxHistory, setBackgroundSyncError} from './actions/history'
import {
  isFingerprintEncryptionHardwareSupported,
  canFingerprintEncryptionBeEnabled,
  isSystemAuthSupported,
} from './helpers/deviceSettings'
import l10n from './l10n'
import {backgroundLockListener} from './helpers/backgroundLockHelper'
import {encryptCustomPin} from './crypto/customPin'
import {
  readAppSettings,
  writeAppSettings,
  AppSettingsError,
  APP_SETTINGS_KEYS,
} from './helpers/appSettings'
import networkInfo from './utils/networkInfo'
import {loadLanguage} from './actions/language'
import storage from './utils/storage'
import {type Dispatch} from 'redux'
import {type State} from './state'
import NavigationService from './NavigationService'
import {ROOT_ROUTES, FIRST_RUN_ROUTES} from './RoutesList'

const LOCAL_STORAGE_ACCEPTED_TOS = '/settings/acceptedTos'

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

export const setSystemAuth = (enable: boolean) => (dispatch: Dispatch<any>) => {
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

  dispatch({
    path: ['auth', 'isSystemAuthEnabled'],
    payload: enable,
    reducer: (state: State, value: boolean) => value,
    type: 'SET_SYSTEM_AUTH',
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
  path: null,
  payload: appSettings,
  type: 'SET_APP_ID',
  reducer: (state, appSettings) => ({
    ...state,
    appSettings: {
      ...state.appSettings,
      appId: appSettings.appId,
    },
    auth: {
      ...state.auth,
      customPinHash: appSettings.customPinHash,
    },
  }),
})

const reloadAppSettings = () => async (dispatch: Dispatch<any>) => {
  const appSettings = await readAppSettings()
  dispatch(_setAppSettings(appSettings))
}

const _setAppId = (appId) => ({
  path: ['appSettings', 'appId'],
  payload: appId,
  type: 'SET_APP_ID',
  reducer: (state, appId) => appId,
})

const _setCustomPinHash = (customPinHash) => ({
  path: ['auth', 'customPinHash'],
  payload: customPinHash,
  type: 'SET_CUSTOM_PIN_HASH',
  reducer: (state, customPinHash) => customPinHash,
})

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
  await writeAppSettings(APP_SETTINGS_KEYS.CUSTOM_PIN_HASH, customPinHash)
  dispatch(_setCustomPinHash(customPinHash))
}

export const navigateFromSplash = () => (
  dispatch: Dispatch<any>,
  getState: any,
) => {
  // TODO(ppershing): here we should switch between
  // onboarding and normal wallet flow
  const state = getState()

  if (!state.languageCode) {
    NavigationService.navigate(ROOT_ROUTES.FIRST_RUN)
  } else if (!state.appSettings.acceptedTos) {
    NavigationService.navigate(FIRST_RUN_ROUTES.ACCEPT_TERMS_OF_SERVICE)
  } else {
    NavigationService.navigate(ROOT_ROUTES.INDEX)
  }
}

const acceptTos = () => (dispatch: Dispatch<any>) =>
  dispatch({
    type: 'Accept tos',
    path: ['appSettings', 'acceptedTos'],
    payload: true,
    reducer: (state, payload) => payload,
  })

export const notifyOfGeneralError = (errorToLog: string, exception: Object) => {
  Logger.error(errorToLog, exception)

  Alert.alert(
    l10n.translations.global.alerts.errorHeading,
    l10n.translations.global.alerts.generalErrorText,
  )
}

export const acceptAndSaveTos = () => async (dispatch: Dispatch<any>) => {
  await storage.write(LOCAL_STORAGE_ACCEPTED_TOS, true)

  dispatch(acceptTos())
}

export const loadAcceptedTos = () => async (dispatch: Dispatch<any>) => {
  try {
    const acceptedTos = await storage.read(LOCAL_STORAGE_ACCEPTED_TOS)
    if (acceptedTos) {
      dispatch(acceptTos())
    }
  } catch (e) {
    Logger.error('Loading tos consent failed. UI language left intact.', e)
    throw e
  }
}

export const initApp = () => async (dispatch: Dispatch<any>, getState: any) => {
  AppState.addEventListener('change', () => {
    backgroundLockListener()
  })

  const state = getState()
  if (state.isAppInitialized) {
    dispatch(navigateFromSplash())
    return
  }

  await dispatch(reloadAppSettings())

  if (!state.appSettings.appId) {
    const appId = uuid.v4()
    await writeAppSettings(APP_SETTINGS_KEYS.APP_ID, appId)
    dispatch(_setAppId(appId))
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
  await dispatch(loadAcceptedTos())
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

export const closeWallet = () => async (dispatch: Dispatch<any>) => {
  await walletManager.closeWallet()
}

export const removeCurrentWallet = () => async (dispatch: Dispatch<any>) => {
  await walletManager.removeCurrentWallet()
  dispatch(updateWallets())
}
