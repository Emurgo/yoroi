// @flow

export const TX_HISTORY_ROUTES = {
  MAIN: 'tx-history-list',
  TX_DETAIL: 'tx-details',
  ADDRESS_DETAIL: 'tx-details-address',
}

export const SEND_ROUTES = {
  MAIN: 'send-ada',
  ADDRESS_READER_QR: 'address-reader-qr',
  CONFIRM: 'send-ada-confirm',
  SENDING_MODAL: 'send-ada-modal',
  BIOMETRICS_SIGNING: 'biometrics-signing',
}

export const RECEIVE_ROUTES = {
  MAIN: 'receive-ada',
  ADDRESS_MODAL: 'address-modal',
}

export const FIRST_RUN_ROUTES = {
  LANGUAGE: 'language-pick',
  ACCEPT_TERMS_OF_SERVICE: 'accept-terms-of-service',
  CUSTOM_PIN: 'custom-pin',
}

export const WALLET_INIT_ROUTES = {
  MAIN: 'choose-create-restore',
  CREATE_WALLET: 'create-wallet-form',
  RESTORE_WALLET: 'restore-wallet-form',
  RECOVERY_PHRASE: 'recovery-phrase',
  RECOVERY_PHRASE_DIALOG: 'recovery-phrase-dialog',
  RECOVERY_PHRASE_CONFIRMATION: 'recovery-phrase-confirmation',
  RECOVERY_PHRASE_CONFIRMATION_DIALOG: 'recovery-phrase-confirmation-dialog',
  WALLET_CREDENTIALS: 'wallet-credentials',
}

export const SETTINGS_ROUTES = {
  MAIN: 'settings',
  CHANGE_WALLET_NAME: 'change-wallet-name',
  TERMS_OF_USE: 'terms-of-use',
  SUPPORT: 'support',
  FINGERPRINT_LINK: 'fingerprint-link',
  REMOVE_WALLET: 'remove-wallet',
  CHANGE_LANGUAGE: 'change-language',
  EASY_COMFIRMATION: 'easy-confirmation',
}

export const WALLET_ROUTES = {
  TX_HISTORY: 'history',
  SEND: SEND_ROUTES.MAIN,
  RECEIVE: RECEIVE_ROUTES.MAIN,
  SETTINGS: SETTINGS_ROUTES.MAIN,
}

export const ROOT_ROUTES = {
  SPLASH: 'splash',
  INDEX: 'screens-index',
  LOGIN: 'login',
  BIO_AUTH: 'bio-auth',
  CUSTOM_PIN_AUTH: 'custom-pin-auth',
  FIRST_RUN: 'first-run',
  NEW_WALLET: 'new-wallet',
  WALLET_SELECTION: 'wallet-selection',
  WALLET: 'app-root',
}
