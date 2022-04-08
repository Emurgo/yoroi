import {CONFIG} from './config'

export const TX_HISTORY_ROUTES = {
  MAIN: 'tx-history-list',
  TX_DETAIL: 'tx-details',
} as const

export const SEND_ROUTES = {
  MAIN: 'send-ada',
  ADDRESS_READER_QR: 'address-reader-qr',
  CONFIRM: 'send-ada-confirm',
  BIOMETRICS_SIGNING: 'biometrics-signing',
} as const

export const RECEIVE_ROUTES = {
  MAIN: 'receive-ada',
} as const

export const FIRST_RUN_ROUTES = {
  LANGUAGE: 'language-pick',
  ACCEPT_TERMS_OF_SERVICE: 'accept-terms-of-service',
  CUSTOM_PIN: 'custom-pin',
} as const

export const WALLET_INIT_ROUTES = {
  CREATE_RESTORE_SWITCH: 'choose-create-restore',
  INITIAL_CREATE_RESTORE_SWITCH: 'initial-choose-create-restore',
  CREATE_WALLET: 'create-wallet-form',
  RESTORE_WALLET: 'restore-wallet-form',
  IMPORT_READ_ONLY_WALLET: 'import-read-only',
  SAVE_READ_ONLY_WALLET: 'save-read-only',
  CHECK_NANO_X: 'check-nano-x',
  CONNECT_NANO_X: 'connect-nano-x',
  SAVE_NANO_X: 'save-nano-x',
  MNEMONIC_SHOW: 'mnemoinc-show',
  MNEMONIC_CHECK: 'mnemonic-check',
  VERIFY_RESTORED_WALLET: 'wallet-account-checksum',
  WALLET_CREDENTIALS: 'wallet-credentials',
} as const

export const SETTINGS_ROUTES = {
  MAIN: 'settings',
  CHANGE_WALLET_NAME: 'change-wallet-name',
  TERMS_OF_USE: 'terms-of-use',
  SUPPORT: 'support',
  FINGERPRINT_LINK: 'fingerprint-link',
  REMOVE_WALLET: 'remove-wallet',
  CHANGE_LANGUAGE: 'change-language',
  EASY_CONFIRMATION: 'easy-confirmation',
  CHANGE_PASSWORD: 'change-password',
  CHANGE_CUSTOM_PIN: 'change-custom-pin',
  BIO_AUTHENTICATE: 'bio-authenticate',
  SETUP_CUSTOM_PIN: 'setup-custom-pin',
} as const

export const SETTINGS_TABS = {
  WALLET_SETTINGS: 'wallet-settings',
  APP_SETTINGS: 'app-settings',
} as const

export const STAKING_CENTER_ROUTES = {
  MAIN: 'staking-center',
  DELEGATION_CONFIRM: 'delegation-confirmation',
} as const

export const STAKING_DASHBOARD_ROUTES = {
  MAIN: 'staking-dashboard',
} as const

export const DELEGATION_ROUTES = {
  STAKING_DASHBOARD: STAKING_DASHBOARD_ROUTES.MAIN,
  STAKING_CENTER: STAKING_CENTER_ROUTES.MAIN,
} as const

export const WALLET_ROUTES = {
  TX_HISTORY: 'history',
  SEND: SEND_ROUTES.MAIN,
  RECEIVE: RECEIVE_ROUTES.MAIN,
  DASHBOARD: DELEGATION_ROUTES.STAKING_DASHBOARD,
  DELEGATE: DELEGATION_ROUTES.STAKING_CENTER,
} as const

export const WALLET_ROOT_ROUTES = {
  WALLET_SELECTION: 'wallet-selection',
  MAIN_WALLET_ROUTES: 'main-wallet-routes',
  SETTINGS: SETTINGS_ROUTES.MAIN,
} as const

const INDEX_SCREEN = 'screens-index'
const LOGIN_SCREEN = 'login'
const INIT_SCREEN = CONFIG.DEBUG.START_WITH_INDEX_SCREEN ? INDEX_SCREEN : LOGIN_SCREEN

export const ROOT_ROUTES = {
  SPLASH: 'splash',
  INDEX: INDEX_SCREEN,
  LOGIN: LOGIN_SCREEN,
  BIO_AUTH: 'bio-auth',
  CUSTOM_PIN_AUTH: 'custom-pin-auth',
  FIRST_RUN: 'first-run',
  NEW_WALLET: 'new-wallet',
  WALLET: 'app-root',
  INIT: INIT_SCREEN,
  STORYBOOK: 'storybook',
  MAINTENANCE: 'maintenance',
} as const
