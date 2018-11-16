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
  },

  Login: {
    title: 'Enter PIN',
  },

  LanguagePicker: {
    selectLanguage: 'SELECT YOUR LANGAUAGE',
    chooseLanguage: 'CHOOSE LANGUAGE',
  },

  TxHistory: {
    availableAmount: {
      label: 'Available funds',
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

    TxNavigationButtons: {
      sendButton: 'SEND',
      receiveButton: 'RECEIVE',
    },
  },

  TxDetails: {
    fromAddresses: 'From Addresses',
    toAddresses: 'To Addresses',
    transactionId: 'Transaction ID',
    txAssuranceLevel: 'Transaction assurance level',

    transactionHeader: {
      SENT: 'ADA sent',
      RECEIVED: 'ADA received',
      SELF: 'Intrawallet',
      MULTI: 'Multi party',
    },
    formatConfirmations: (cnt: number) =>
      `${cnt} ${pluralizeEn(cnt, 'CONFIRMATION', 'CONFIRMATIONS')}`,
  },

  SendTx: {
    title: 'Send',
    scanCode: 'Scan QR code',
    address: 'Address',
    amount: 'Amount',
    continue: 'Continue',
    fetchingError:
      'We are experiencing issue with fetching your current balance.',

    AvailableAmount: {
      label: 'Available amount:',
      isFetching: 'Checking balance...',
      error: 'Error',
    },

    ValidationErrors: {
      pendingOutgoingTransaction: [
        'You cannot send a new transaction while',
        'an existing one is still pending',
      ].join(' '),
      offline: 'You are offline',
      serverFailed: 'There is a failing transaction',
      invalidAddress: 'Please enter valid address',
      invalidAmountErrors: {
        INVALID_AMOUNT: 'Please enter valid amount',
        INSUFFICIENT_BALANCE: 'Not enough money to make this transaction',
      },
    },

    Confirmation: {
      confirmButton: 'Confirm',
      amount: 'Amount',
      availableFunds: 'AVAILABLE FUNDS:',
      balanceAfterTx: 'Balance after transaction',
      fees: 'Fees',
      walletPassword: 'Wallet password',
      receiver: 'Receiver',
    },
    submitWaitMessage: 'Please wait while transaction is submited',
  },

  ReceiveTx: {
    title: 'Receive',
    infoText: [
      'Share this address to receive payments.',
      'To protect your privacy, new address are',
      'generated automatically once you use them.',
    ].join(' '),
    generate: 'GENERATE',
    cannotGenerate: 'You have to use some of your addresses',
    // TODO put into ReceiveScreen
    walletAddressTitle: 'Your wallet address',
    walletAddressesTitle: 'Your wallet addresses',
    hideUsedAddresses: 'hide used',
    showUsedAddresses: 'show used',

    AddressDetail: {
      BIP32path: 'BIP32 path:',
      copyLabel: 'COPY ADDRESS',
      copiedLabel: 'COPIED',
    },
  },

  WalletInit: {
    createWallet: 'CREATE A NEW WALLET',
    restoreWallet: 'RESTORE WALLET FROM BACKUP',

    WalletDescription: {
      webLightWalletMessage: 'Yoroi is Web Light Wallet for Cardano',
      secureFastSimpleMessage: 'Secure Fast Simple',
      byEmurgo: 'By',
    },
  },

  CreateWallet: {
    title: 'Create a new wallet',
    nameLabel: 'Wallet name',
    passwordLabel: 'Wallet password',
    passwordConfirmationLabel: 'Repeat password',
    passwordRequirementsNote: 'The password needs to contain at least:',
    passwordMinLength: '7 characters',
    passwordUpperChar: '1 uppercase letter',
    passwordLowerChar: '1 lowercase letter',
    passwordNumber: '1 number',
    createButton: 'CREATE PERSONAL WALLET',
  },

  RecoveryPhrase: {
    title: 'Recovery phrase',
    mnemonicNote:
      'Please, make sure you have carefully written down your recovery phrase\
      somewhere safe. You will need this phrase to use and restore your wallet.\
      Phrase is case sensitive.',
    confirmationButton: 'YES, I`VE WRITTEN IT DOWN',

    RecoveryExplanationDialog: {
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

    RecoveryConfirmationScreen: {
      title: 'Recovery phrase',
      instructions:
        'Tap each word in the correct order to verify your recovery phrase',
      inputLabel: 'Recovery phrase',
      invalidPhrase: 'Recovery phrase does not match',
      clearButton: 'CLEAR',
      confirmButton: 'CONFIRM',
    },

    RecoveryConfirmationDialog: {
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
  },

  RestoreWallet: {
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

  Settings: {
    title: 'Settings',
    edit: 'Edit',
    privacy: 'Privacy',

    WalletSettings: {
      walletName: 'Wallet name',
      ChangeWalletName: {
        walletName: 'Wallet name',
        changeButtonText: 'CHANGE NAME',
        walletValidationText:
          'Wallet name requires at least 3 and at most\
       40 letters.',
      },

      changePasswordTitle: 'Change password',
      ChangePassword: {},

      removeWalletTitle: 'Remove wallet',
      RemoveWalet: {},

      easyConfirmationTitle: 'Easy transaction confirmation',
      EasyConfirmation: {},
    },

    ApplicationSettings: {
      languageTitle: 'Your language',
      Language: {},

      changePinTitle: 'Change PIN',
      ChangePin: {},

      fingerprintSignInTitle: 'Sign in with your fingerprint',

      downloadLogsTitle: 'Download logs',
      downloadLogsText:
        'If you want to inspect logs, you can download\
      them here. Logs do not contain sensitive information, and it would be\
      helpful to attach them to problem reports to help the team investigate\
      the issue you are experiencing.',

      termsOfUseTitle: 'Terms of use',
      TermsOfService: {
        title: 'Terms of Service Agreement',
        content: [...termsOfService],
      },

      supportTitle: 'Support',
      Support: {
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
    },
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

  FingerprintLink: {
    enableFingerprintsMessage:
      'Enable use of fingerprints in device settings first!',
    notNowButton: 'Not now',
    linkButton: 'Link',
  },

  BiometryAuth: {
    errorDialogTitle: 'Error',

    Authentication: {
      authenticationRequiredTitle: 'Authentication required',
      touchInstructions: 'Touch the sensor',
      withPin: 'Authenticate using PIN',
      pinCodeLabel: ' ',
    },

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
  },
}

export default l10n
