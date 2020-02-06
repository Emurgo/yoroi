// @flow

import {defineMessages} from 'react-intl'

/*
 * Some messages need to be used in multiple components
 * In order to avoid componenets depending on each other just to resuse translation messages
 * We instead store the shared messages in this file
*/

export const confirmationMessages = {
  logout: defineMessages({
    title: {
      id: 'global.actions.dialogs.logout.title',
      defaultMessage: '!!!Logout',
    },
    message: {
      id: 'global.actions.dialogs.logout.message',
      defaultMessage: '!!!Do you really want to logout?',
    },
    yesButton: {
      id: 'global.actions.dialogs.logout.yesButton',
      defaultMessage: '!!!Yes',
    },
    noButton: {
      id: 'global.actions.dialogs.logout.noButton',
      defaultMessage: '!!!No',
    },
  }),
  commonButtons: defineMessages({
    confirmButton: {
      id: 'global.actions.dialogs.commonbuttons.confirmButton',
      defaultMessage: '!!!Confirm',
    },
    continueButton: {
      id: 'global.actions.dialogs.commonbuttons.continueButton',
      defaultMessage: '!!!Continue',
    },
    cancelButton: {
      id: 'global.actions.dialogs.commonbuttons.cancelButton',
      defaultMessage: '!!!Cancel',
    },
    backButton: {
      id: 'global.actions.dialogs.commonbuttons.backButton',
      defaultMessage: '!!!Back',
    },
  }),
}

export const errorMessages = {
  pinMismatch: defineMessages({
    title: {
      id: 'global.actions.dialogs.pinMismatch.title',
      defaultMessage: '!!!Invalid PIN',
    },
    message: {
      id: 'global.actions.dialogs.pinMismatch.message',
      defaultMessage: '!!!PINs do not match.',
    },
  }),
  incorrectPin: defineMessages({
    title: {
      id: 'global.actions.dialogs.incorrectPin.title',
      defaultMessage: '!!!Invalid PIN',
    },
    message: {
      id: 'global.actions.dialogs.incorrectPin.message',
      defaultMessage: '!!!The PIN you entered is incorrect.',
    },
  }),
  incorrectPassword: defineMessages({
    title: {
      id: 'global.actions.dialogs.incorrectPassword.title',
      defaultMessage: '!!!Wrong password',
    },
    message: {
      id: 'global.actions.dialogs.incorrectPassword.message',
      defaultMessage: '!!!Password you provided is incorrect.',
    },
  }),
  biometricsIsTurnedOff: defineMessages({
    title: {
      id: 'global.actions.dialogs.biometricsIsTurnedOff.title',
      defaultMessage: '!!!Biometrics was turned off',
    },
    message: {
      id: 'global.actions.dialogs.biometricsIsTurnedOff.message',
      defaultMessage:
        '!!!It seems that you turned off biometrics, please turn it on',
    },
  }),
  walletKeysInvalidated: defineMessages({
    title: {
      id: 'global.actions.dialogs.walletKeysInvalidated.title',
      defaultMessage: '!!!Biometrics changed',
    },
    message: {
      id: 'global.actions.dialogs.walletKeysInvalidated.message',
      defaultMessage:
        '!!!We detected that your biometrics in phone changed. ' +
        'As a result the easy transaction confirmation was disabled ' +
        'and transaction submitting is allowed only with master password. ' +
        'You can re-enable easy transactions confirmation in settings',
    },
  }),
  networkError: defineMessages({
    title: {
      id: 'global.actions.dialogs.networkError.title',
      defaultMessage: '!!!Network error',
    },
    message: {
      id: 'global.actions.dialogs.networkError.message',
      defaultMessage:
        '!!!Error connecting to the server. ' +
        'Please check your internet connection',
    },
  }),
  apiError: defineMessages({
    title: {
      id: 'global.actions.dialogs.apiError.title',
      defaultMessage: '!!!API error',
    },
    message: {
      id: 'global.actions.dialogs.apiError.message',
      defaultMessage:
        '!!!Error received from api method call while sending transaction. ' +
        'Please try again later or check our Twitter account (https://twitter.com/YoroiWallet)',
    },
  }),
  insufficientBalance: defineMessages({
    title: {
      id: 'global.actions.dialogs.insufficientBalance.title',
      defaultMessage: '!!!Transaction error',
    },
    message: {
      id: 'global.actions.dialogs.insufficientBalance.message',
      defaultMessage: '!!Not enough funds to make this transaction',
    },
  }),
  disableEasyConfirmationFirst: defineMessages({
    title: {
      id: 'global.actions.dialogs.disableEasyConfirmationFirst.title',
      defaultMessage: '!!!Action failed',
    },
    message: {
      id: 'global.actions.dialogs.disableEasyConfirmationFirst.message',
      defaultMessage:
        '!!Please disable easy confirmation function in all ' +
        'your wallets first',
    },
  }),
  enableFingerprintsFirst: defineMessages({
    title: {
      id: 'global.actions.dialogs.enableFingerprintsFirst.title',
      defaultMessage: '!!!Action failed',
    },
    message: {
      id: 'global.actions.dialogs.enableFingerprintsFirst.message',
      defaultMessage:
        '!!!You need to enable biometrics in your device first in order ' +
        'to be able link it with this app',
    },
  }),
  enableSystemAuthFirst: defineMessages({
    title: {
      id: 'global.actions.dialogs.enableSystemAuthFirst.title',
      defaultMessage: '!!!Lock screen disabled',
    },
    message: {
      id: 'global.actions.dialogs.enableSystemAuthFirst.message',
      defaultMessage:
        '!!!You probably disabled lock screen in your phone. You need to ' +
        'disable easy transaction confirmation first. Please set up ' +
        'you lock screen (PIN / Password / Pattern) on your phone ' +
        'and then restart application. After this action you should be ' +
        'able to disable lock screen ' +
        'on your phone and use this application',
    },
  }),
  wrongPinError: defineMessages({
    title: {
      id: 'global.actions.dialogs.wrongPinError.title',
      defaultMessage: '!!!Invalid PIN',
    },
    message: {
      id: 'global.actions.dialogs.wrongPinError.message',
      defaultMessage: '!!!PIN is incorrect.',
    },
  }),
  generalError: defineMessages({
    title: {
      id: 'global.actions.dialogs.generalError.title',
      defaultMessage: '!!!Unexpected error',
    },
    message: {
      id: 'global.actions.dialogs.generalError.message',
      defaultMessage:
        '!!!Requested operation failed. This is all we know: {message}',
    },
  }),
}

export default defineMessages({
  walletNameErrorTooLong: {
    id: 'global.error.walletNameTooLong',
    defaultMessage: 'Wallet name cannot exceed 40 letters',
  },
  walletNameErrorNameAlreadyTaken: {
    id: 'global.error.walletNameAlreadyTaken',
    defaultMessage: 'You already have a wallet with this name',
  },
  pleaseWait: {
    id: 'global.pleaseWait',
    defaultMessage: '!!!please wait ...',
    description: 'Common messages for time consuming actions',
  },
  tos: {
    id: 'global.termsOfUse',
    defaultMessage: '!!!Terms of use',
  },
  ok: {
    id: 'global.ok',
    defaultMessage: '!!!OK',
  },
  availableFunds: {
    id: 'global.availableFunds',
    defaultMessage: '!!!Available funds',
  },
  epochLabel: {
    id: 'global.staking.epochLabel',
    defaultMessage: '!!!Epoch',
  },
  totalAda: {
    id: 'global.totalAda',
    defaultMessage: '!!!Total ADA',
  },
  stakePoolName: {
    id: 'global.staking.stakePoolName',
    defaultMessage: '!!!Stake pool name',
  },
  stakePoolHash: {
    id: 'global.staking.stakePoolHash',
    defaultMessage: '!!!Stake pool hash',
  },
  syncErrorBannerTextWithoutRefresh: {
    id: 'global.network.syncErrorBannerTextWithoutRefresh',
    defaultMessage: '!!!We are experiencing synchronization issues.',
  },
  syncErrorBannerTextWithRefresh: {
    id: 'global.network.syncErrorBannerTextWithRefresh',
    defaultMessage:
      '!!!We are experiencing synchronization issues. Pull to refresh',
  },
})
