// @flow

export const TX_HISTORY_ROUTES = {
  MAIN: 'tx-history-list',
  TX_DETAIL: 'tx-details',
}

export const SEND_ROUTES = {
  MAIN: 'send-ada',
  CONFIRM: 'send-ada-confirm',
  ADDRESS_READER_QR: 'address-reader-qr',
}

export const RECEIVE_ROUTES = {
  MAIN: 'receive-ada',
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

export const MAIN_ROUTES = {
  TX_HISTORY: 'history',
  SEND: SEND_ROUTES.MAIN,
  RECEIVE: RECEIVE_ROUTES.MAIN,
}

export const ROOT_ROUTES = {
  MAIN: 'app-root',
  INIT: WALLET_INIT_ROUTES.MAIN,
  INDEX: 'screens-index',
}
