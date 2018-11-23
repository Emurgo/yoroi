// @flow
import {pluralizeEn} from './util'
import {termsOfService} from './tos.en'

const languages = {
  chineseSimplified: '简体中文',
  chineseTraditional: '繁體中文',
  english: 'English',
  japanese: '日本語',
  korean: '한국어',
  russian: 'Russian',
}

const datetime = {
  today: 'Today',
  yesterday: 'Yesterday',
}

const l10n = {
  global: {
    languages,
    datetime,
    notifications: {
      offline: 'You are offline. Please check settings on your device.',
    },
    alerts: {
      errorHeading: 'Error',
      generalErrorText:
        'Something wrong happened.' +
        'Please try repeating your action or contact us.',
    },
    currentLanguageName: 'English',
  },
  errorDialogs: {
    general: {
      title: 'Unexpected error',
      message: 'Your operation did not complete',
      yesButton: 'OK',
    },
    pinMismatch: {
      title: 'Invalid PIN',
      message: 'PINs do not match.',
      yesButton: 'OK',
    },
    incorrectPassword: {
      title: 'Wrong password',
      message: 'Password you provided is incorrect.',
      yesButton: 'OK',
    },
    biometricsIsTurnedOff: {
      title: 'Biometrics was turned off',
      message: 'It seems that you turned off biometrics, please turn it on',
      yesButton: 'OK',
    },
    networkError: {
      title: 'Network error',
      message:
        'Error connecting to the server. ' +
        'Please check your internet connection',
      yesButton: 'OK',
    },
    disableEasyConfirmationFirst: {
      title: 'Action failed',
      message:
        'Please disable easy confirmation function in all \
your wallets first',
      yesButton: 'OK',
    },
    wrongPinError: {
      title: 'Invalid PIN',
      message: 'PIN is incorrect.',
      yesButton: 'OK',
    },
  },
  LanguageSelectionScreen: {
    languages,
    selectLanguage: 'SELECT YOUR LANGAUAGE',
    continueButton: 'CHOOSE LANGUAGE',
  },
  YoroiDescription: {
    line1: 'Yoroi is Web Light Wallet for Cardano',
    line2: 'Secure Fast Simple',
    byEmurgo: 'By',
  },
  AppStartScreen: {
    loginButton: 'Login',
  },
  // TODO(ppershing): Is this used? What about LoginByPinScreen?
  AppLoginScreen: {
    title: 'Enter PIN',
  },
  CreateOrRestoreWalletScreen: {
    createWallet: 'CREATE A NEW WALLET',
    restoreWallet: 'RESTORE WALLET FROM BACKUP',
    createWalletScreen: {
      title: 'Create a new wallet',
    },
  },
  WalletNameAndPasswordForm: {
    nameLabel: 'Wallet name',
    passwordLabel: 'Wallet password',
    passwordConfirmationLabel: 'Repeat password',
    createButton: 'CREATE PERSONAL WALLET',
    continueButton: 'Continue',
    passwordsDoNotMatch: 'Passwords do not match',
  },
  PasswordStrengthIndicator: {
    passwordRequirementsNote: 'The password needs to contain at least:',
    passwordMinLength: '7 characters',
    passwordUpperChar: '1 uppercase letter',
    passwordLowerChar: '1 lowercase letter',
    passwordNumber: '1 number',
    continueButton: 'Continue',
    passwordBigLength: '12 characters',
    or: 'Or',
  },
  TransactionHistoryScreeen: {
    availableAmount: {
      label: 'Available funds',
    },
    transaction: {
      transactionType: {
        SENT: 'ADA sent',
        RECEIVED: 'ADA received',
        SELF: 'Intrawallet',
        MULTI: 'Multiparty',
      },
      assuranceLevelHeader: 'Assurance level:',
      assuranceLevel: {
        LOW: 'Low',
        MEDIUM: 'Medium',
        HIGH: 'High',
        PENDING: 'Pending',
        FAILED: 'Failed',
      },
      fee: (fee: number) => `Fee: ${fee}`,
    },
    sendButton: 'SEND',
    receiveButton: 'RECEIVE',
  },
  TransactionDetailsScreen: {
    transactionType: {
      SENT: 'Sent funds',
      RECEIVED: 'Received funds',
      SELF: 'Intrawallet transaction',
      MULTI: 'Multi-party transaction',
    },
    fee: 'Fee: ',
    fromAddresses: 'From Addresses',
    toAddresses: 'To Addresses',
    transactionId: 'Transaction ID',
    txAssuranceLevel: 'Transaction assurance level',
    formatConfirmations: (cnt: number) =>
      `${cnt} ${pluralizeEn(cnt, 'CONFIRMATION', 'CONFIRMATIONS')}`,
    formatOmittedCount: (cnt: number) => `+ ${cnt} omitted`,
  },
  SendAdaScreen: {
    title: 'Send',
    scanCode: 'Scan QR code',
    address: 'Address',
    amount: 'Amount',
    continueButton: 'Continue',
    calculatingFee: 'calculating...',
    feeLabel: 'Fee',
    balanceAfterLabel: 'Balance after',
    availableAmount: {
      label: 'Available amount:',
      isFetching: 'Checking balance...',
      hasError: 'Error',
    },
    validationErrors: {
      pendingOutgoingTransaction:
        'You cannot send a new transaction while ' +
        'an existing one is still pending',
      offline: 'You are offline',
      serverFailed: 'There is a failing transaction',
      invalidAddress: 'Please enter valid address',
      invalidAmount: 'Please enter valid amount',
      insufficientBalance: 'Not enough money to make this transaction',
    },
    fetchingError:
      'We are experiencing issue with fetching your current balance.',
  },
  ConfirmSendAdaScreen: {
    confirmButton: 'Confirm',
    amount: 'Amount',
    availableFunds: 'AVAILABLE FUNDS:',
    balanceAfterTx: 'Balance after transaction',
    fees: 'Fees',
    password: 'Wallet password',
    receiver: 'Receiver',
  },
  WaitSendTransactionModal: {
    submitting: 'Please wait while transaction is submited',
  },
  WalletCredentialsScreen: {
    title: 'Wallet credentials',
  },
  ChangeWalletNameScreen: {
    title: 'Change wallet name',
    walletName: 'Wallet name',
    changeButtonText: 'CHANGE NAME',
    walletValidationText:
      'Wallet name requires at least 1 and at most\
 40 letters.',
  },
  ReceiveScreen: {
    title: 'Receive',
    infoText:
      'Share this address to receive payments. ' +
      'To protect your privacy, new address are ' +
      'generated automatically once you use them.',
    generateButton: 'Generate another address',
    cannotGenerate: 'You have to use some of your addresses',

    addressesList: {
      walletAddresses: 'Your wallet addresses',
    },
  },
  AddressDetailsModal: {
    walletAddress: 'Your wallet address',
    BIP32path: 'BIP32 path:',
    copyLabel: 'COPY ADDRESS',
    copiedLabel: 'COPIED',
  },
  RecoveryPhraseConfirmationDialog: {
    title: 'Recovery phrase',
    keysStorageCheckbox:
      'I understand that my secret keys are held securely ' +
      'on this device only, not on the company`s servers',
    newDeviceRecoveryCheckbox:
      'I understand that if this application is moved to another device ' +
      'or delete, my money can be only recovered with the backup phrase that ' +
      'I have written down and saved in secure place.',
    confirmationButton: 'I UNDERSTAND',
  },
  RecoveryPhraseConfirmationScreen: {
    title: 'Recovery phrase',
    instructions:
      'Tap each word in the correct order to verify your recovery phrase',
    inputLabel: 'Recovery phrase',
    invalidPhrase: 'Recovery phrase does not match',
    clearButton: 'CLEAR',
    confirmButton: 'CONFIRM',
  },
  RecoveryPhraseExplanationDialog: {
    title: 'Recovery phrase',
    paragraph1:
      'On the following screen, you will see a set of 15 random words. ' +
      'This is your wallet backup phrase. ' +
      'It can be entered in any version ' +
      'of Yoroi in order to back up or restore ' +
      'your wallet`s funds and private key.',
    paragraph2:
      'Make sure nobody looks into your screen unless you want them ' +
      'to have access to your funds.',
    nextButton: 'NEXT',
  },
  RecoveryPhraseScreen: {
    title: 'Recovery phrase',
    mnemonicNote:
      'Please, make sure you have carefully written down your ' +
      'recovery phrase somewhere safe. ' +
      'You will need this phrase to use and restore your wallet. ' +
      'Phrase is case sensitive.',
    confirmationButton: 'YES, I`VE WRITTEN IT DOWN',
  },
  RestoreWalletScreen: {
    title: 'Restore wallet',
    instructions:
      'To restore your wallet please provide the recovery phrase you ' +
      'received when you created your wallet for the first time.',
    phrase: 'Recovery phrase',
    restoreButton: 'RESTORE WALLET',
    errors: {
      MAX_LENGTH: 'Phrase is too long',
      INVALID_CHECKSUM: 'Please enter valid mnemonic',
      UNKNOWN_WORDS: (words: Array<string>) => {
        const wordlist = words.map((word) => `'${word}'`).join(', ')
        return `${wordlist} ${pluralizeEn(words.length, 'is', 'are')} invalid.`
      },
    },
  },
  SettingsScreen: {
    title: 'Settings',
    switchWallet: 'Switch wallet',
    walletName: 'Wallet name',
    edit: 'Edit',
    privacy: 'Privacy',
    changePin: 'Change PIN',
    changePassword: 'Change password',
    biometricsSignIn: 'Sign in with your biometrics',
    easyConfirmation: 'Easy transaction confirmation',
    downloadLogs: 'Download logs',
    downloadLogsText:
      'If you want to inspect logs, you can download them here. ' +
      'Logs do not contain sensitive information, and it would be ' +
      'helpful to attach them to problem reports to help the team ' +
      'investigate the issue you are experiencing.',
    removeWallet: 'Remove wallet',
    language: 'Your language',
    termsOfUse: 'Terms of Use',
    support: 'Support',
    systemAuthDisable: {
      title: 'Action failed',
      text:
        'Please disable easy confirmation function in all ' +
        'your wallets first',
      okButton: 'Ok',
    },
  },
  SupportScreen: {
    title: 'Support',
    faq: {
      label: 'See frequently asked questions',
      description:
        'If you are experiencing issues, please see the FAQ\
 on Yoroi website for quidance on known issues.',
      url: 'https://yoroi-wallet.com/faq/',
    },
    report: {
      label: 'Report a problem',
      description:
        'If the FAQ does not solve the issue you are\
 experiencing, please use our Support request feature.',
      url: 'https://yoroi-wallet.com/support/',
    },
  },
  TermsOfServiceScreen: {
    title: 'Terms of Service Agreement',
    aggreeClause: 'I agree with terms of service',
    continue: 'ACCEPT',
    content: [...termsOfService],
  },
  WalletSelectionScreen: {
    addWallet: 'Add wallet',
    header: 'Your wallets',
  },
  // TODO(ppershing): Where is this screen used?
  SigninScreen: {
    welcomeText: 'Sign with PIN / TouchID',
  },
  // TODO(ppershing): why the heck is this different from ConfirmAdaScreen?
  // I guess this should be moved there
  ConfirmScreen: {
    Confirmation: {
      confirmButton: 'Confirm',
      amount: 'Amount',
      availableFunds: 'AVAILABLE FUNDS:',
      balanceAfterTx: 'Balance after transaction',
      fees: 'Fees',
      password: 'Wallet password',
      receiver: 'Receiver',
    },
  },
  BiometricsLinkScreen: {
    enableFingerprintsMessage:
      'Enable use of fingerprints in device settings first!',
    notNowButton: 'Not now',
    linkButton: 'Link',
  },
  // TODO(ppershing): Not sure what would be good name for this
  BiometricsAuth: {
    errorDialogTitle: 'Error',
    NotSupportedErrors: {
      deviceNotSupported: 'Your device does not support biometrics!',
      biometricsOrPinNotSet: 'Go to system setttings and rise your security',
      pinSetButBiometricsNot: 'Go to system setttings and rise your security',
      notSupported: 'Not supported error',
    },
    AuthenticateErrors: {
      text: 'Authenticate error',
      canceled: 'User canceled authentication',
      failed: 'Authentication failed',
    },
    Authentication: {
      authenticationRequiredTitle: 'Authentication required',
      touchInstructions: 'Touch the sensor',
      withPin: 'Authenticate using PIN',
      pinCodeLabel: ' ', // TODO(ppershing): why is this empty?
    },
  },
  RemoveWalletScreen: {
    title: 'Remove wallet',
    description:
      'Enter your wallet password if you wish to ' +
      'remove it from this YOROI application',
    walletName: 'Wallet name',
    password: 'Wallet password',
    remove: 'Remove wallet',
  },
  ChoosePinScreen: {
    PinInput: {
      title: 'Enter the PIN',
      subtitle: 'Choose a PIN for quick access to wallet.',
    },
  },
  LoginByPinScreen: {
    PinInput: {
      title: 'Enter PIN',
    },
    WrongPinError: {
      title: 'Invalid PIN',
      text: 'PIN you provided is incorrect',
    },
    UnknownError: {
      title: 'Unknown error',
      text: 'There was error while verifying PIN.',
    },
  },
  ChangePasswordScreen: {
    oldPassword: 'Current password',
    newPassword: 'New password',
    repeatPassword: 'Repeat new password',
    continue: 'Change password',
    title: 'Change wallet password',
    passwordsDoNotMatch: 'Passwords do not match',
  },
  ChangeCustomPinScreen: {
    CurrentPinInput: {
      title: 'Enter the PIN',
      subtitle: 'Enter your current PIN',
    },
    PinRegistrationForm: {
      PinInput: {
        title: 'Enter the PIN',
        subtitle: 'Choose new PIN for quick access to wallet.',
      },
      PinConfirmationInput: {
        title: 'Repeat PIN',
      },
    },
  },
}

export default l10n
