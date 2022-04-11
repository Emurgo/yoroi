import {defineMessages} from 'react-intl'

/*
 * Some messages need to be used in multiple components
 * In order to avoid components depending on each other just to reuse translation messages
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
  resync: defineMessages({
    title: {
      id: 'global.actions.dialogs.resync.title',
      defaultMessage: '!!!Title',
    },
    message: {
      id: 'global.actions.dialogs.resync.message',
      defaultMessage: '!!!Message',
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
    completeButton: {
      id: 'global.actions.dialogs.commonbuttons.completeButton',
      defaultMessage: '!!!Complete',
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
  confirmTx: {
    id: 'global.txLabels.confirmTx',
    defaultMessage: '!!!Confirm transaction',
  },
  fees: {
    id: 'global.txLabels.fees',
    defaultMessage: '!!!Fees',
  },
  from: {
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.fromLabel',
    defaultMessage: '!!!From',
  },
  password: {
    id: 'global.txLabels.password',
    defaultMessage: '!!!Spending password',
  },
  receiver: {
    id: 'global.txLabels.receiver',
    defaultMessage: '!!!Receiver',
  },
  stakeDeregistration: {
    id: 'global.txLabels.stakeDeregistration',
    defaultMessage: '!!!Staking key deregistration',
  },
  submittingTx: {
    id: 'global.txLabels.submittingTx',
    defaultMessage: '!!!Submitting transaction',
  },
  signingTx: {
    id: 'global.txLabels.signingTx',
    defaultMessage: '!!!Signing transaction',
  },
  to: {
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.toLabel',
    defaultMessage: '!!!To',
  },
  transactions: {
    id: 'global.txLabels.transactions',
    defaultMessage: '!!!Transactions',
  },
  txId: {
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.txIdLabel',
    defaultMessage: '!!!Transaction ID',
  },
  withdrawals: {
    id: 'global.txLabels.withdrawals',
    defaultMessage: '!!!Withdrawals',
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
  haveOTGAdapter: {
    id: 'global.ledgerMessages.haveOTGAdapter',
    defaultMessage:
      '!!!You have an on-the-go adapter allowing you to connect your Ledger' +
      'device with your smartphone using a USB cable.',
  },
  usbAlwaysConnected: {
    id: 'global.ledgerMessages.usbAlwaysConnected',
    defaultMessage: '!!!Your Ledger device remains connected through USB until the process' + 'is completed.',
  },
  appInstalled: {
    id: 'global.ledgerMessages.appInstalled',
    defaultMessage: '!!!Cardano ADA app is installed on your Ledger device.',
  },
  appOpened: {
    id: 'global.ledgerMessages.appOpened',
    defaultMessage: '!!!Cardano ADA app must remain open on your Ledger device.',
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
  connectUsb: {
    id: 'global.ledgerMessages.connectUsb',
    defaultMessage: "!!!Connect your Ledger device through your smartphone's" + 'USB port using your OTG adapter.',
  },
  keepUsbConnected: {
    id: 'global.ledgerMessages.keepUsbConnected',
    defaultMessage: '!!!Make sure your device remains connected until the ' + 'operation is completed.',
  },
  enterPin: {
    id: 'global.ledgerMessages.enterPin',
    defaultMessage: '!!!Power on your ledger device and enter your PIN.',
  },
  openApp: {
    id: 'global.ledgerMessages.openApp',
    defaultMessage: '!!!Open Cardano ADA app on the Ledger device.',
  },
  followSteps: {
    id: 'global.ledgerMessages.followSteps',
    defaultMessage: '!!!Please, follow the steps shown in your Ledger device',
  },
  // common errors
  bluetoothDisabledError: {
    id: 'global.ledgerMessages.bluetoothDisabledError',
    defaultMessage: '!!!Bluetooth is disabled in your smartphone',
  },
  connectionError: {
    id: 'global.ledgerMessages.connectionError',
    defaultMessage:
      '!!!An error occurred while trying to connect with your ' +
      'hardware wallet. Please, make sure you are following the steps' +
      'correctly. Restarting your hardware wallet may also fix the problem.',
  },
  deprecatedAdaAppError: {
    id: 'global.ledgerMessages.deprecatedAdaAppError',
    defaultMessage:
      '!!!The Cardano ADA app installed in your Ledger device' + 'is not up-to-date. Required version: {version}',
  },
  rejectedByUserError: {
    id: 'global.ledgerMessages.rejectedByUserError',
    defaultMessage: '!!!Operation rejected by user.',
  },
  noDeviceInfoError: {
    id: 'global.ledgerMessages.noDeviceInfoError',
    defaultMessage:
      '!!!Device metadata was lost or corrupted. To fix this issue' +
      ', please add a new wallet and connect it with your device.',
  },
  continueOnLedger: {
    id: 'global.ledgerMessages.continueOnLedger',
    defaultMessage: '!!!Continue on Ledger',
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
      defaultMessage: '!!!It seems that you turned off biometrics, please turn it on',
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
  itnNotSupported: defineMessages({
    title: {
      id: 'global.actions.dialogs.itnNotSupported.title',
      defaultMessage: '!!!ITN Wallet not longer supported',
    },
    message: {
      id: 'global.actions.dialogs.itnNotSupported.message',
      defaultMessage:
        '!!!Wallets created during the Incentivized Testnet (ITN) are no ' +
        'longer operative. If you would like to claim your rewards, we will ' +
        'update Yoroi Mobile as well as Yoroi Desktop in the next couple ' +
        'of weeks.',
    },
  }),
  networkError: defineMessages({
    title: {
      id: 'global.actions.dialogs.networkError.title',
      defaultMessage: '!!!Network error',
    },
    message: {
      id: 'global.actions.dialogs.networkError.message',
      defaultMessage: '!!!Error connecting to the server. ' + 'Please check your internet connection',
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
      defaultMessage: '!!!Please disable easy confirmation function in all ' + 'your wallets first',
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
        '!!!You need to enable biometrics in your device first in order ' + 'to be able link it with this app',
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
        '!!!An error occurred while trying to connect with your ' +
        'hardware wallet. Please, make sure you are following the steps' +
        'correctly. Restarting your hardware wallet may also fix the problem.' +
        'Error: {message}',
    },
  }),
  notSupportedError: defineMessages({
    title: {
      id: 'global.notSupported',
      defaultMessage: '!!!Feature not supported',
    },
    message: {
      id: 'global.actions.dialogs.notSupportedError.message',
      defaultMessage: '!!!This feature is not yet supported. It will be enabled ' + 'in a future release.',
    },
  }),
  generalError: defineMessages({
    title: {
      id: 'global.actions.dialogs.generalError.title',
      defaultMessage: '!!!Unexpected error',
    },
    message: {
      id: 'global.actions.dialogs.generalError.message',
      defaultMessage: '!!!Requested operation failed. This is all we know: {message}',
    },
  }),
  generalLocalizableError: defineMessages({
    title: {
      id: 'global.actions.dialogs.generalLocalizableError.title',
      defaultMessage: '!!!Operation failed',
    },
    message: {
      id: 'global.actions.dialogs.generalLocalizableError.message',
      defaultMessage: '!!!Requested operation failed: {message}',
    },
  }),
  generalTxError: defineMessages({
    title: {
      id: 'global.actions.dialogs.generalTxError.title',
      defaultMessage: '!!!Transaction Error',
    },
    message: {
      id: 'global.actions.dialogs.generalTxError.message',
      defaultMessage: '!!!An error occurred while trying to send the transaction.',
    },
  }),
  invalidQRCode: defineMessages({
    title: {
      id: 'global.actions.dialogs.invalidQRCode.title',
      defaultMessage: '!!!Invalid QR code',
    },
    message: {
      id: 'global.actions.dialogs.invalidQRCode.message',
      defaultMessage:
        '!!!The QR code you scanned does not seem to contain a valid public ' + 'key. Please try again with a new one.',
    },
  }),
  fetchError: defineMessages({
    title: {
      id: 'global.actions.dialogs.fetchError.title',
      defaultMessage: '!!!Server error',
    },
    message: {
      id: 'global.actions.dialogs.fetchError.message',
      defaultMessage:
        '!!!An error occurred when Yoroi tried to fetch your wallet state from ' +
        'the server. Please try again later.',
    },
  }),
}

export const assetMessages = defineMessages({
  assets: {
    id: 'global.assets.assetsLabel',
    defaultMessage: '!!!Assets',
  },
})

export const actionMessages = defineMessages({
  send: {
    id: 'global.send',
    defaultMessage: '!!!Send',
  },
  receive: {
    id: 'global.receive',
    defaultMessage: '!!!Receive',
  },
  buy: {
    id: 'global.buy',
    defaultMessage: '!!!Buy',
  },
  soon: {
    id: 'global.comingSoon',
    defaultMessage: '!!!Coming soon',
  },
})

export default defineMessages({
  allDone: {
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.noUpgradeLabel',
    defaultMessage: '!!!All done!',
  },
  attention: {
    id: 'components.stakingcenter.poolwarningmodal.title',
    defaultMessage: '!!!Attention',
  },
  tryAgain: {
    id: 'global.tryAgain',
    defaultMessage: '!!!Try again',
  },
  walletNameErrorTooLong: {
    id: 'global.error.walletNameTooLong',
    defaultMessage: '!!!Wallet name cannot exceed 40 letters',
  },
  walletNameErrorNameAlreadyTaken: {
    id: 'global.error.walletNameAlreadyTaken',
    defaultMessage: '!!!You already have a wallet with this name',
  },
  walletNameErrorMustBeFilled: {
    id: 'global.error.walletNameMustBeFilled',
    defaultMessage: '!!!Must be filled',
  },
  pleaseWait: {
    id: 'global.pleaseWait',
    defaultMessage: '!!!please wait ...',
    description: 'Common messages for time consuming actions',
  },
  pleaseConfirm: {
    id: 'global.pleaseConfirm',
    defaultMessage: '!!!Please confirm',
  },
  tos: {
    id: 'global.termsOfUse',
    defaultMessage: '!!!Terms of use',
  },
  ok: {
    id: 'global.ok',
    defaultMessage: '!!!OK',
  },
  close: {
    id: 'global.close',
    defaultMessage: '!!!close',
  },
  availableFunds: {
    id: 'global.availableFunds',
    defaultMessage: '!!!Available funds',
  },
  comingSoon: {
    id: 'global.comingSoon',
    defaultMessage: '!!!Coming soon',
  },
  deprecated: {
    id: 'global.deprecated',
    defaultMessage: '!!!Deprecated',
  },
  epochLabel: {
    id: 'global.staking.epochLabel',
    defaultMessage: '!!!Epoch',
  },
  learnMore: {
    id: 'components.maintenancemodal.learnMore',
    defaultMessage: '!!!Learn more',
  },
  notSupported: {
    id: 'global.notSupported',
    defaultMessage: '!!!Feature not supported',
  },
  total: {
    id: 'global.total',
    defaultMessage: '!!!Total',
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
    defaultMessage: '!!!We are experiencing synchronization issues. Pull to refresh',
  },
  assetsLabel: {
    id: 'global.assets.assetsLabel',
    defaultMessage: '!!!Assets',
  },
  votingTitle: {
    id: 'components.catalyst.title',
    defaultMessage: '!!!Register to vote',
  },
  insufficientBalance: {
    id: 'components.catalyst.insufficientBalance',
    defaultMessage:
      '!!!Participating requires at least {requiredBalance},' +
      'but you only have {currentBalance}. Unwithdrawn rewards are ' +
      'not included in this amount',
  },
  nfts: {
    id: 'global.nfts',
    defaultMessage: '!!! NFTs',
  },
  tokens: {
    id: 'global.tokens',
    defaultMessage: '!!! Tokens',
  },
})
