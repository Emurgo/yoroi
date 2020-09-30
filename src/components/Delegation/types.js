// @flow

export const WITHDRAWAL_DIALOG_STEPS = {
  CLOSED: 'CLOSED',
  WARNING: 'WARNING',
  CHOOSE_TRANSPORT: 'CHOOSE_TRANSPORT',
  LEDGER_CONNECT: 'LEDGER_CONNECT',
  CONFIRM: 'CONFIRM',
  WAITING: 'WAITING',
}

export type WithdrawalDialogSteps = $Values<typeof WITHDRAWAL_DIALOG_STEPS>
