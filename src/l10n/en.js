// @flow
import {pluralizeEn} from './util'
import {termsOfService} from './tos.en'

const language = {
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
    language,
    datetime,
    notifications: {
      offline: 'You are offline. Please check settings on your device.',
    },
    currentLanguageName: 'English',
  },
  AppStartScreen: {
    loginButton: 'Login',
  },
  LoginScreen: {
    title: 'Enter PIN',
  },
  LanguagePicker: {
    selectLanguage: 'SELECT YOUR LANGAUAGE',
    continue: 'CHOOSE LANGUAGE',
  },
  TxHistoryListItem: {
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
  TxHistory: {
    availableAmount: {
      label: 'Available funds',
    },
  },
  TxDetails: {
    type: {
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
  TxNavigationButtons: {
    sendButton: 'SEND',
    receiveButton: 'RECEIVE',
  },
  Send: {
    Main: {
      title: 'Send',
      scanCode: 'Scan QR code',
      address: 'Address',
      amount: 'Amount',
      continue: 'Continue',
      availableAmount: {
        label: 'Available amount:',
        isFetching: 'Checking balance...',
        hasError: 'Error',
      },
      validationErrors: {
        pendingOutgoingTransaction: [
          'You cannot send a new transaction while',
          'an existing one is still pending',
        ].join(' '),
        offline: 'You are offline',
        serverFailed: 'There is a failing transaction',
        invalidAddress: 'Please enter valid address',
        invalidAmount: 'Please enter valid amount',
        insufficientBalance: 'Not enough money to make this transaction',
      },
      fetchingError:
        'We are experiencing issue with fetching your current balance.',
    },
    Confirmation: {
      confirmButton: 'Confirm',
      amount: 'Amount',
      availableFunds: 'AVAILABLE FUNDS:',
      balanceAfterTx: 'Balance after transaction',
      fees: 'Fees',
      password: 'Wallet password',
      receiver: 'Receiver',
    },
    SubmitModal: {
      submitting: 'Please wait while transaction is submited',
    },
  },
  WalletInitScreen: {
    createWallet: 'CREATE A NEW WALLET',
    restoreWallet: 'RESTORE WALLET FROM BACKUP',
  },
  WalletDescription: {
    line1: 'Yoroi is Web Light Wallet for Cardano',
    line2: 'Secure Fast Simple',
    byEmurgo: 'By',
  },
  CreateWalletScreen: {
    title: 'Create a new wallet',
  },
  WalletForm: {
    nameLabel: 'Wallet name',
    passwordLabel: 'Wallet password',
    passwordConfirmationLabel: 'Repeat password',
    passwordRequirementsNote: 'The password needs to contain at least:',
    passwordMinLength: '7 characters',
    passwordUpperChar: '1 uppercase letter',
    passwordLowerChar: '1 lowercase letter',
    passwordNumber: '1 number',
    continueButton: 'Continue',
  },
  WalletCredentialsScreen: {
    title: 'Wallet credentials',
  },
  ChangeWalletName: {
    title: 'Change wallet name',
    walletName: 'Wallet name',
    changeButtonText: 'CHANGE NAME',
    walletValidationText:
      'Wallet name requires at least 3 and at most\
 40 letters.',
    errorDialog: {
      title: 'Error',
      text: 'Failed to update wallet name',
      ok: 'OK',
    },
  },
  ReceiveScreen: {
    title: 'Receive',
    infoText: [
      'Share this address to receive payments.',
      'To protect your privacy, new address are',
      'generated automatically once you use them.',
    ].join(' '),
    generate: 'Generate another address',
    cannotGenerate: 'You have to use some of your addresses',
  },
  AddressDetail: {
    walletAddress: 'Your wallet address',
  },
  AddressesList: {
    walletAddresses: 'Your wallet addresses',
    hideUsedAddresses: 'hide used',
    showUsedAddresses: 'show used',
  },
  AddressModal: {
    BIP32path: 'BIP32 path:',
    copyLabel: 'COPY ADDRESS',
    copiedLabel: 'COPIED',
  },
  RecoveryPhraseConfirmationDialog: {
    title: 'Recovery phrase',
    keysStorageCheckbox:
      'I understand that my secret keys are held securely on this device only,\
 not on the company`s servers',
    newDeviceRecoveryCheckbox:
      'I understand that if this application is moved to another device\
 or delete, my money can be only recovered with the backup phrase that\
 I have written down and saved in secure place.',
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
      'On the following screen, you will see a set of 15 random words. This\
 is your wallet backup phrase. It can be entered in version of Yoroi in order\
 to back up or restore your wallet`s funds and private key.',
    paragraph2:
      'Make sure nobody looks into your screen unless you want them to have\
 access to your funds.',
    nextButton: 'NEXT',
  },
  RecoveryPhraseScreen: {
    title: 'Recovery phrase',
    mnemonicNote:
      'Please, make sure you have carefully written down your recovery phrase\
 somewhere safe. You will need this phrase to use and restore your wallet.\
 Phrase is case sensitive.',
    confirmationButton: 'YES, I`VE WRITTEN IT DOWN',
  },
  RestoreWalletScreen: {
    title: 'Restore wallet',
    instructions:
      'To restore your wallet please provide the recovery phrase you\
 received when you created your wallet for the first time.',
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
    fingerprintSignIn: 'Sign in with your fingerprint',
    easyConfirmation: 'Easy transaction confirmation',
    downloadLogs: 'Download logs',
    downloadLogsText:
      'If you want to inspect logs, you can download\
 them here. Logs do not contain sensitive information, and it would be\
 helpful to attach them to problem reports to help the team investigate\
 the issue you are experiencing.',
    removeWallet: 'Remove wallet',
    language: 'Your language',
    termsOfUse: 'Terms of Use',
    support: 'Support',
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
  SigninScreen: {
    welcomeText: 'Sign with PIN / TouchID',
  },
  ConfirmScreen: {
    ErrorDialogs: {
      WrongPassword: {
        title: 'Wrong password',
        text: 'Password you provided is incorrect',
      },
      UnknownError: {
        title: 'Unknown error submitting transaction',
        text: (message: string) => `Details: ${message}`,
      },
      okTextButton: 'OK',
    },
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
  FingerprintLinkScreen: {
    enableFingerprintsMessage:
      'Enable use of fingerprints in device settings first!',
    notNowButton: 'Not now',
    linkButton: 'Link',
  },
  BiometryAuth: {
    errorDialogTitle: 'Error',
    NotSupportedErrors: {
      deviceNotSupported: 'Your device does not support biometry!',
      biometryOrPinNotSet: 'Go to system setttings and rise your security',
      pinSetButBiometryNot: 'Go to system setttings and rise your security',
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
      pinCodeLabel: ' ',
    },
  },
  RemoveWalletScreen: {
    title: 'Remove wallet',
    description:
      'Enter your wallet password if you wish to remove it\
 from this YOROI application',
    walletName: 'Wallet name',
    password: 'Wallet password',
    remove: 'Remove wallet',
    ErrorDialogs: {
      okButton: 'OK',
      VerificationError: {
        title: 'Wrong password',
        text: 'Password you provided is incorrect.',
      },
      WalletRemovalError: {
        title: 'Unknown error',
        text: 'There was error while removing your wallet.',
      },
    },
  },
  CustomPinScreen: {
    PinInput: {
      title: 'Enter the PIN',
      subtitle: 'Choose a PIN for quick access to wallet.',
    },
    PinConfirmationInput: {
      title: 'Repeat PIN',
    },
    PinMismatchError: {
      title: 'Invalid PIN',
      text: 'PIN does not match.',
    },
    okButton: 'OK',
  },
}

export default l10n
