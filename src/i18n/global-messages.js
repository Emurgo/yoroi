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
    iUnderstandButton: {
      id: 'global.actions.dialogs.commonbuttons.iUnderstandButton',
      defaultMessage: '!!!I understand',
    },
  }),
}

// common strings used when displaying tx data
export const txLabels = defineMessages({
  amount: {
    id: 'global.txLabels.amount',
    defaultMessage: '!!!Amount',
  },
  balanceAfterTx: {
    id: 'global.txLabels.balanceAfterTx',
    defaultMessage: '!!!Balance after transaction',
  },
  fees: {
    id: 'global.txLabels.fees',
    defaultMessage: '!!!Fees',
  },
  password: {
    id: 'global.txLabels.password',
    defaultMessage: '!!!Spending password',
  },
  receiver: {
    id: 'global.txLabels.receiver',
    defaultMessage: '!!!Receiver',
  },
  submittingTx: {
    id: 'global.txLabels.submittingTx',
    defaultMessage: 'Submitting transaction',
  },
})

export const ledgerMessages = defineMessages({
  // prerequisites
  bluetoothEnabled: {
    id: 'global.ledgerMessages.bluetoothEnabled',
    defaultMessage: '!!!Bluetooth is enabled on your smartphone.',
  },
  locationEnabled: {
    id: 'global.ledgerMessages.locationEnabled',
    defaultMessage:
      '!!!Location is enabled on your device.' +
      'Android requires location to be enabled to provide access to Bluetooth,' +
      ' but EMURGO will never store any location data.',
  },
  appInstalled: {
    id: 'global.ledgerMessages.appInstalled',
    defaultMessage:
      '!!!Cardano ADA app is installed on your Ledger Nano X device.',
  },
  appOpened: {
    id: 'global.ledgerMessages.appOpened',
    defaultMessage:
      '!!!Cardano ADA app must remain open on your Ledger Nano X device.',
  },
  // connection requisites
  enableTransport: {
    id: 'global.ledgerMessages.enableTransport',
    defaultMessage: '!!!Enable bluetooth.',
  },
  enableLocation: {
    id: 'global.ledgerMessages.enableLocation',
    defaultMessage: '!!!Enable location services.',
  },
  enterPin: {
    id: 'global.ledgerMessages.enterPin',
    defaultMessage: '!!!Power on your ledger device and enter your PIN.',
  },
  openApp: {
    id: 'global.ledgerMessages.openApp',
    defaultMessage: '!!!Open Cardano ADA app on the Ledger device.',
  },
  // common errors
  bluetoothDisabledError: {
    id: 'global.ledgerMessages.bluetoothDisabledError',
    defaultMessage: '!!!Bluetooth is disabled in your smartphone',
  },
  connectionError: {
    id: 'global.ledgerMessages.connectionError',
    defaultMessage:
      '!!!An error occured while trying to connect with your ' +
      'hardware wallet. Please, make sure you are following the steps' +
      'correctly. Restarting your hardware wallet may also fix the problem.',
  },
})

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
  walletStateInvalid: defineMessages({
    title: {
      id: 'global.actions.dialogs.walletStateInvalid.title',
      defaultMessage: '!!!Invalid wallet state',
    },
    message: {
      id: 'global.actions.dialogs.walletStateInvalid.message',
      defaultMessage:
        '!!!Your wallet is in an inconsistent state. You may solve this by ' +
        'restoring your wallet with your mnemonics. Please contact EMURGO ' +
        'support to report this issue as this may help us fix the problem ' +
        'in a future release.',
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
  hwConnectionError: defineMessages({
    title: {
      id: 'global.actions.dialogs.hwConnectionError.title',
      defaultMessage: '!!!Connection error',
    },
    message: {
      id: 'global.actions.dialogs.hwConnectionError.message',
      defaultMessage:
        '!!!An error occured while trying to connect with your ' +
        'hardware wallet. Please, make sure you are following the steps' +
        'correctly. Restarting your hardware wallet may also fix the problem.',
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
  attention: {
    id: 'components.stakingcenter.poolwarningmodal.title',
    defaultMessage: 'Attention',
  },
  tryAgain: {
    id: 'global.tryAgain',
    defaultMessage: 'Try again',
  },
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
