// @flow
import {pluralizeEn, bold, normal, inline} from './util'
import {termsOfService} from './tos.en'

// Do not translate
const languages = {
  // TODO: Add back when chinese is available
  // chineseSimplified: '简体中文',
  // chineseTraditional: '繁體中文',
  english: 'English',
  japanese: '日本語',
  korean: '한국어',
  russian: 'Русский',
}

const datetime = {
  today: '今天',
  yesterday: '昨天',
} 

const walletNameErrors = {
  tooLong: '錢包名稱不能超過40個字母',
  nameAlreadyTaken: '"已有這名字的錢包",',
}

// common translations shared across multiple places
const common = {
  ok: 'OK',
  availableFunds: '可用資金',
  pleaseWait: '請稍候....',
}

// ios system translations
const ios = {
  NSFaceIDUsageDescription:
    '啟用Face ID 可讓您快速、安全地存取您的帳戶。',
  NSCameraUsageDescription: '允許相機掃描QR碼',
}

const l10n = {
  global: {
    languages,
    datetime,
    ios,
    notifications: {
      offline: '你現在是離線. 請檢查設備上的設置',
    },
    currentLanguageName: '繁體中文',
  },
  confirmationDialogs: {
    logout: {
      title: '登出',
      message: '你要登出嗎？',
      yesButton: '是',
      noButton: '不是',
    },
  },
  errorDialogs: {
    generalError: (message: string) => ({
      title: '發生錯誤',
      message: `請求操作失敗。 我們所知道: ${message} `,
      yesButton: common.ok,
    }),
    pinMismatch: {
      title: '不正確 pin 碼',
      message: 'PIN不正確',
      yesButton: common.ok,
    },
    incorrectPin: {
      title: '不正確 pin 碼',
      message: '您輸入的 pin 碼不正確',
      yesButton: common.ok,
    },
    incorrectPassword: {
      title: '密碼錯誤',
      message: '您輸入的 pin 碼不正確',
      yesButton: common.ok,
    },
    biometricsIsTurnedOff: {
      title: ' 生物識別技術已關閉',
      message: '你似乎關閉了生物識別技術, 請把它打開',
      yesButton: common.ok,
    },
    walletKeysInvalidated: {
      title: '生物識別技術已變更',
      message:
        '我們檢測到你手機裡的生物識別技術已更改。' ' +
        '因此簡單的交易確認被停用'+
        ʻ使用主密碼來允許交易提交。 ' +
        '您可以在設置中重新啟用輕鬆的交易確認',
      yesButton: 'OK',
    },
    networkError: {
      title: '網絡錯誤',
      message:
        '連接到服務器時出錯。 ' +
        '請檢查你的網絡連接',
      yesButton: common.ok,
    },
    disableEasyConfirmationFirst: {
      title: '操作失敗',
      message:
        '請關閉所有的簡易確認功能 ' +
        '於你的錢包',
      yesButton: common.ok,
    },
    enableFingerprintsFirst: {
      title: '操作失敗',
      message:
        ' 您需要先在設備中啟用生物識別 ' +
        '才能夠將它與這個應用程序鏈接',
      yesButton: 'OK',
    },
    enableSystemAuthFirst: {
      title: '鎖定屏幕無効',
      message:
        '您可能禁用了手機中的鎖定屏幕。 你需要'+
        首先停用簡單交易確認 再設定' +
        '您在手機上鎖定屏幕 (PIN /密碼)' +
        '然後重啟應用程序 在這操作後你應該 ' +
        '能夠關閉鎖屏 ' +
        '',
      yesButton: 'OK',
    },
    wrongPinError: {
      title: '不正確 pin 碼',
      message: 'PIN碼不正確.',
      yesButton: 'OK',
    },
  },
  LanguageSelectionScreen: {
    languages,
    continueButton: '選擇語言',
  },
  YoroiDescription: {
    line1: 'Yoroi是CARDANO的輕錢包',
    簡便、快捷且安全
    byEmurgo: 'By',
  },
  AppStartScreen: {
    loginButton: '登入',
  },
  WithPinLoginScreen: {
    title: '輸入PIN碼',
  },
  CreateWalletScreen: {
    title: '建立新錢包',
  },
  CreateOrRestoreWalletScreen: {
    title: '增添錢包',
    createWalletButton: '創建新錢包',
    restoreWalletButton: '從備份恢復錢包',
  },
  // On CreateWalletScreen
  MnemonicExplanationModal: {
    paragraph1: [
      inline([
        normal(
          '在之後的屏幕上，您將看到一組15個隨機單詞。 ',
        ),
        normal('這是你的 '),
        bold('錢包恢復短語。 '),
        normal('可以在任何版本的Yoroi輸入
        normal('來備份或恢復'),
        normal('你的Yoroi錢包的資金和私鑰。'),
      ]),
    ],
    paragraph2: [
      inline([
        normal('請確保'),
        bold('沒人看著你的屏幕 '),
        normal('除非你希望他們能夠獲得你的資金。'),
      ]),
    ],
    nextButton: '我了解',
  },
  WalletNameAndPasswordForm: {
    walletNameInput: {
      label: '錢包名稱',
      errors: walletNameErrors,
    },
    newPasswordInput: {
      label: '錢包密碼',
    },
    repeatPasswordInput: {
      label: '重複輸入密碼',
      errors: {
        passwordsDoNotMatch: '密碼不配',
      },
    },
    continueButton: '繼續',
  },
  PasswordStrengthIndicator: {
    passwordRequirementsNote: '密碼至少需要包含:',
    passwordMinLength: '7個字',
    passwordUpperChar: '1個大寫字母',
    passwordLowerChar: '1個小寫字母',
    passwordNumber: '1個數字',
    continueButton: '繼續',
    passwordBigLength: '12個字符',
    or: '或',
  },
  TransactionHistoryScreeen: {
    syncErrorBanner: {
      textWithoutRefresh: '我們遇到了同步問題。',
      textWithRefresh:
        '我們遇到了同步問題。 再刷新'，
    },
    availableFundsBanner: {
      label: common.availableFunds,
    },
    noTransactions: '暫無任何交易',
    交易: {
      transactionType: {
        SENT: 'ADA發送',
        RECEIVED: '已收ADA',
        SELF: '錢包內',
        MULTI: '多方',
      },
      assuranceLevelHeader: '保證等級',
      assuranceLevel: {
        LOW: '低',
        MEDIUM: '中',
        HIGH: '高',
        PENDING: '等候',
        FAILED: '失敗',
      },
      fee: '費用:',
    },
    sendButton: '發送',
    receiveButton: '接收',
  },
  TransactionDetailsScreen: {
    transactionType: {
      SENT: '已發送資金',
      RECEIVED: '收到的資金',
      SELF: '錢包內交易',
      MULTI: '多方交易',
    },
    fee: 'Fee: ',
    fromAddresses: 'From Addresses',
    toAddresses: 'To Addresses',
    transactionId: 'Transaction ID',
    txAssuranceLevel: 'Transaction assurance level',
    formatConfirmations: (cnt: number) =>
      `${cnt} ${pluralizeEn(cnt, 'CONFIRMATION', 'CONFIRMATIONS')}`,
    formatOmittedCount: (cnt: number) => `+ ${cnt} omitted`,
    addressPrefix: {
      receive: (idx: number) => `/${idx}`,
      change: (idx: number) => '/change',
      notMine: 'not mine',
    },
  },
  SendAdaScreen: {
    title: 'Send',
    fee: {
      label: 'Fee',
      notAvailable: '-',
    },
    balanceAfter: {
      label: 'Balance after',
      notAvailable: '-',
    },
    availableFundsBanner: {
      label: common.availableFunds,
      isFetching: 'Checking balance...',
      notAvailable: '-',
    },
    addressInput: {
      label: 'Address',
      errors: {
        invalidAddress: 'Please enter valid address',
      },
    },
    amountInput: {
      label: 'Amount',
      errors: {
        invalidAmount: {
          // Note(ppershing): first two should be auto-corrected
          // by the input control
          INVALID_AMOUNT: 'Please enter valid amount',
          TOO_MANY_DECIMAL_PLACES: 'Please enter valid amount',

          TOO_LARGE: 'Amount too large',
          NEGATIVE: 'Amount must be positive',
        },
        insufficientBalance: 'Not enough money to make this transaction',
      },
    },
    continueButton: 'Continue',
    errorBanners: {
      // note: offline banner is shared with TransactionHistory
      networkError:
        'We are experiencing issues with fetching your current balance. ' +
        'Click to retry.',
      pendingOutgoingTransaction:
        'You cannot send a new transaction while ' +
        'an existing one is still pending',
    },
  },
  ReadQRCodeAddressScreen: {
    title: 'Scan QR code address',
  },
  ConfirmSendAdaScreen: {
    title: 'Send',
    amount: 'Amount',
    availableFundsBanner: {
      label: common.availableFunds,
    },
    balanceAfterTx: 'Balance after transaction',
    fees: 'Fees',
    password: 'Wallet password',
    receiver: 'Receiver',
    confirmButton: 'Confirm',
    sendingModalTitle: 'Submitting transaction',
    pleaseWait: common.pleaseWait,
  },
  WalletCredentialsScreen: {
    title: 'Wallet credentials',
  },
  ChangeWalletNameScreen: {
    title: 'Change wallet name',
    walletNameInput: {
      label: 'Wallet name',
      errors: walletNameErrors,
    },
    changeButton: 'Change name',
  },
  ReceiveScreen: {
    title: 'Receive',
    infoText:
      'Share this address to receive payments. ' +
      'To protect your privacy, new addresses are ' +
      'generated automatically once you use them.',
    generateButton: 'Generate another address',
    cannotGenerate: 'You have to use some of your addresses',
    freshAddresses: 'Fresh addresses',
    usedAddresses: 'Used addresses',
  },
  AddressDetailsModal: {
    walletAddress: 'Your wallet address',
    BIP32path: 'BIP32 path:',
    copyLabel: 'Copy address',
    copiedLabel: 'Copied',
  },
  MnemonicShowScreen: {
    title: 'Recovery phrase',
    mnemonicNote:
      'Please, make sure you have carefully written down your ' +
      'recovery phrase somewhere safe. ' +
      'You will need this phrase to use and restore your wallet. ' +
      'Phrase is case sensitive.',
    confirmationButton: 'Yes, I have written it down',
  },
  MnemonicBackupImportanceModal: {
    title: 'Recovery phrase',
    keysStorageCheckbox:
      'I understand that my secret keys are held securely ' +
      'on this device only, not on the company`s servers',
    newDeviceRecoveryCheckbox:
      'I understand that if this application is moved to another device ' +
      'or delete, my money can be only recovered with the backup phrase that ' +
      'I have written down and saved in secure place.',
    confirmationButton: 'I understand',
  },
  MnemonicCheckScreen: {
    title: 'Recovery phrase',
    instructions:
      'Tap each word in the correct order to verify your recovery phrase',
    mnemonicWordsInput: {
      label: 'Recovery phrase',
      errors: {
        invalidPhrase: 'Recovery phrase does not match',
      },
    },
    clearButton: 'Clear',
    confirmButton: 'Confirm',
  },
  RestoreWalletScreen: {
    title: 'Restore wallet',
    instructions:
      'To restore your wallet please provide the recovery phrase you ' +
      'received when you created your wallet for the first time.',
    mnemonicInput: {
      label: 'Recovery phrase',
      errors: {
        TOO_LONG: 'Phrase is too long. ',
        TOO_SHORT: 'Phrase is too short. ',
        INVALID_CHECKSUM: 'Please enter valid mnemonic.',
        UNKNOWN_WORDS: (words: Array<string>) => {
          const wordlist = words.map((word) => `'${word}'`).join(', ')
          const areInvalid = `${pluralizeEn(words.length, 'is', 'are')} invalid`
          return `${wordlist} ${areInvalid}`
        },
      },
    },
    restoreButton: 'Restore wallet',
  },
  SettingsScreen: {
    WalletTab: {
      title: 'Settings',
      tabTitle: 'Wallet',

      switchWallet: 'Switch wallet',
      logout: 'Logout',

      walletName: 'Wallet name',

      security: 'Security',
      changePassword: 'Change password',
      easyConfirmation: 'Easy transaction confirmation',

      removeWallet: 'Remove wallet',
    },
    ApplicationTab: {
      title: 'Settings',
      tabTitle: 'Application',

      language: 'Your language',

      security: 'Security',
      changePin: 'Change PIN',
      biometricsSignIn: 'Sign in with your biometrics',

      crashReporting: 'Crash reporting',
      crashReportingText:
        'Send crash reports to Emurgo. ' +
        'Changes to this option will be reflected ' +
        ' after restarting the application.',

      termsOfUse: 'Terms of Use',
      support: 'Support',
    },
  },
  SupportScreen: {
    title: 'Support',
    faq: {
      label: 'See frequently asked questions',
      description:
        'If you are experiencing issues, please see the FAQ ' +
        'on Yoroi website for quidance on known issues.',
      url: 'https://yoroi-wallet.com/faq/',
    },
    report: {
      label: 'Report a problem',
      description:
        'If the FAQ does not solve the issue you are ' +
        'experiencing, please use our Support request feature.',
      url: 'https://yoroi-wallet.com/support/',
    },
  },
  TermsOfServiceScreen: {
    title: 'Terms of Service Agreement',
    content: termsOfService,
    aggreeClause: 'I agree with terms of service',
    continueButton: 'Accept',
    savingConsentModalTitle: 'Initializing',
    pleaseWait: common.pleaseWait,
  },
  WalletSelectionScreen: {
    header: 'Your wallets',
    addWalletButton: 'Add wallet',
  },
  BiometricsLinkScreen: {
    enableFingerprintsMessage:
      'Enable use of fingerprints in device settings first!',
    notNowButton: 'Not now',
    linkButton: 'Link',
    headings: ['Use your fingerprint'],
    subHeadings: ['for faster, easier access', 'to your Yoroi wallet'],
  },
  // TODO(ppershing): this localization is a mess
  BiometricsAuthScreen: {
    authorizeOperation: 'Authorize operation',
    useFallbackButton: 'Use fallback',
    headings: ['Authorize with your', 'fingerprint'],
    cancelButton: 'Cancel',
    errors: {
      NOT_RECOGNIZED: 'Fingerprint was not recognized try again',
      SENSOR_LOCKOUT: 'You used too many fingers sensor is disabled',
      SENSOR_LOCKOUT_PERMANENT:
        'You permanently locked out your fingerprint sensor. Use fallback.',
      DECRYPTION_FAILED: 'Fingerprint sensor failed please use fallback',
      UNKNOWN_ERROR: 'Unknown error',
    },
  },
  RemoveWalletScreen: {
    title: 'Remove wallet',
    description: {
      paragraph1:
        'If you really wish to permanently delete the wallet ' +
        'make sure you have written down the mnemonic.',
      paragraph2: 'To confirm this operation type the wallet name below.',
    },
    walletName: 'Wallet name',
    walletNameInput: 'Wallet name',
    remove: 'Remove wallet',
    hasWrittenDownMnemonic:
      'I have written down mnemonic of this wallet and understand ' +
      'that I cannot recover the wallet without it.',
  },

  ChoosePinScreen: {
    title: 'Set PIN',
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
  ChangePasswordScreen: {
    title: 'Change wallet password',
    oldPasswordInput: {
      label: 'Current password',
    },
    newPasswordInput: {
      label: 'New password',
    },
    repeatPasswordInput: {
      label: 'Repeat new password',
      errors: {
        passwordsDoNotMatch: 'Passwords do not match',
      },
    },
    continueButton: 'Change password',
  },
  ChangeCustomPinScreen: {
    title: 'Change PIN',
    CurrentPinInput: {
      title: 'Enter PIN',
      subtitle: 'Enter your current PIN',
    },
    PinRegistrationForm: {
      PinInput: {
        title: 'Enter PIN',
        subtitle: 'Choose new PIN for quick access to wallet.',
      },
      PinConfirmationInput: {
        title: 'Repeat PIN',
      },
    },
  },
  EasyConfirmationScreen: {
    title: 'Easy confirmation',
    enable: {
      heading:
        'This option will allow you to send ADA transactions ' +
        'from your wallet just by confirming with fingerprint or ' +
        'face recognition with standard system fallback option. ' +
        'This makes your wallet less secure. This is a compromise ' +
        'between UX and security!',
      warning:
        'Please remember your master password, as you may need it ' +
        'in case your biometrics data are removed from the device.',
      masterPassword: 'Master password',
      enableButton: 'Enable',
    },
    disable: {
      heading:
        'By disabling this option you will be able to spend your ADA ' +
        'only with master password.',
      disableButton: 'Disable',
    },
  },
  Biometry: {
    approveTransaction: 'Authorize with your fingerprint',
    subtitle: '', // subtitle for the biometry dialog Andoid 9
    description: '', // description of the biometry dialog Android 9
    cancelButton: 'Cancel',
  },
}

export default l10n
