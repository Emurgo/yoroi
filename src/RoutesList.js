// @flow

export const TX_HISTORY_ROUTES = {
  MAIN: 'tx-history-list',
  TX_DETAIL: 'tx-details',
}

export const SEND_ROUTES = {
  MAIN: 'send-ada',
  ADDRESS_READER_QR: 'address-reader-qr',
  CONFIRM: 'send-ada-confirm',
}

export const RECEIVE_ROUTES = {
  MAIN: 'receive-ada',
  ADDRESS_MODAL: 'address-modal',
}

export const WALLET_INIT_ROUTES = {
  MAIN: 'language-pick',
  INIT: 'wallet-init-mode',
  CREATE_WALLET: 'create-wallet-form',
  RESTORE_WALLET: 'restore-wallet-form',
  RECOVERY_PHRASE: 'recovery-phrase',
  RECOVERY_PHRASE_DIALOG: 'recovery-phrase-dialog',
  RECOVERY_PHRASE_CONFIRMATION: 'recovery-phrase-confirmation',
  RECOVERY_PHRASE_CONFIRMATION_DIALOG: 'recovery-phrase-confirmation-dialog',
}

export const SETTINGS_ROUTES = {
  MAIN: 'settings',
  CHANGE_WALLET_NAME: 'change-wallet-name',
  TERMS_OF_USE: 'terms-of-use',
  SUPPORT: 'support',
  FINGERPRINT_LINK: 'fingerprint-link',
}

export const WALLET_ROUTES = {
  TX_HISTORY: 'history',
  SEND: SEND_ROUTES.MAIN,
  RECEIVE: RECEIVE_ROUTES.MAIN,
  SETTINGS: SETTINGS_ROUTES.MAIN,
}

export const ROOT_ROUTES = {
  INDEX: 'screens-index',
  LOGIN: 'login',
  INIT: WALLET_INIT_ROUTES.MAIN,
  WALLET: 'app-root',
  WALLET_SELECTION: 'wallet-selection',
}
