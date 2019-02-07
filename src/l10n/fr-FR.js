// @flow
import {pluralizeEn, bold, normal, inline} from './util'
import {termsOfService} from './tos.en'

// Do not translate
const languages = {
  // TODO: Add back when chinese is available
  // chineseSimplified: '简体中文',
  // chineseTraditional: '繁體中文',
  english: 'Anglais',
  japanese: 'Japonais',
  korean: 'Coréen',
  russian: 'Russe',
}

const datetime = {
  today: `Aujourd'hui`,
  yesterday: 'Hier',
}

const walletNameErrors = {
  tooLong: 'Le nom du portefeuille ne peut pas dépasser 40 caractères',
  nameAlreadyTaken: 'Un portefeuille du même nom existe déjà',
}

// common translations shared across multiple places
const common = {
  ok: 'OK',
  availableFunds: 'Fonds disponibles',
  pleaseWait: 'veuillez patienter ...',
}

// ios system translations
const ios = {
  NSFaceIDUsageDescription:
    'Activez Face ID pour un accès rapide et sécurisé à votre compte.',
  NSCameraUsageDescription: 'Activez la caméra pour pouvoir scanner des QR codes.',
}

const l10n = {
  global: {
    languages,
    datetime,
    ios,
    notifications: {
      offline: 'Vous êtes hors ligne. Veuillez vérifier les paramètres de votre appareil.',
    },
    currentLanguageName: 'Anglais',
  },
  confirmationDialogs: {
    logout: {
      title: 'Déconnexion',
      message: 'Voulez-vous vraiment vous déconnecter?',
      yesButton: 'Oui',
      noButton: 'Non',
    },
  },
  errorDialogs: {
    generalError: (message: string) => ({
      title: 'Erreur inattendu',
      message: `La requête a échoué. C'est tout ce que nous savons: ${message}`,
      yesButton: common.ok,
    }),
    pinMismatch: {
      title: 'PIN invalide',
      message: 'Les PINs ne correspondent pas.',
      yesButton: common.ok,
    },
    incorrectPin: {
      title: 'PIN invalide',
      message: 'Le PIN que vous avez saisi est incorrect.',
      yesButton: common.ok,
    },
    incorrectPassword: {
      title: 'Mauvais mot de passe',
      message: 'Le mot de passe que vous avez saisi est incorrect.',
      yesButton: common.ok,
    },
    biometricsIsTurnedOff: {
      title: 'Capteur Biométrique désactivé',
      message: 'Il semble que vous ayez désactivé le capteur biométrique. Veuillez le réactiver',
      yesButton: common.ok,
    },
    walletKeysInvalidated: {
      title: 'Empreinte biométrique changée',
      message:
        `Nous avons détecté un changement dans l'empreinte biométrique de votre téléphone. ` +
        'En conséquence, la validation facile des transactions a été désactivé ' +
        `et ne sont disponible qu'avec votre mot de passe. ` +
        `Vous pouvez réactiver les transactions à l'aide du capteur biométrique dans les paramètres.`,
      yesButton: 'OK',
    },
    networkError: {
      title: 'Erreur réseau',
      message:
        'Erreur de connection au serveur. ' +
        'Veuillez vérifier votre connexion internet',
      yesButton: common.ok,
    },
    disableEasyConfirmationFirst: {
      title: `L'action a échoué`,
      message:
        `Veuillez d'abord désactiver la confirmation facile sur tous vos portefeuille`
      yesButton: common.ok,
    },
    enableFingerprintsFirst: {
      title: `L'action a échoué`,
      message:
        `Vous devez d'abord activer le capteur biométrique de cet appareil ` +
        `avant de pouvoir l'utiliser dans cette application`,
      yesButton: 'OK',
    },
    enableSystemAuthFirst: {
      title: 'Vérrouillage désactivé',
      message:
        `Vous avez probablement désactivé le verrouillage de votre téléphone. Vous devez d'abord ` +
        'désactiver la validation facile des transactions. ' +
        'Veuillez configurer le vérrouillage (PIN / Mot de passe / Forme) de votre téléphone  ' +
        `, puis redémarrer l'application. Après cela vous devriez pouvoir ` +
        'désactiver le vérrouillage de votre téléphone ' +
        'et continuer à utiliser cette application.',
      yesButton: 'OK',
    },
    wrongPinError: {
      title: 'PIN invalide',
      message: 'Le PIN est incorrect.',
      yesButton: 'OK',
    },
  },
  LanguageSelectionScreen: {
    languages,
    continueButton: 'Choisissez langue',
  },
  YoroiDescription: {
    line1: 'Yoroi est un portefeuille léger pour Cardano',
    line2: 'Sécurisé Rapide Facile',
    byEmurgo: 'Par',
  },
  AppStartScreen: {
    loginButton: 'Connection',
  },
  WithPinLoginScreen: {
    title: 'Entrez PIN',
  },
  CreateWalletScreen: {
    title: 'Créer un nouveau portefeuille',
  },
  CreateOrRestoreWalletScreen: {
    title: 'Ajouter un portefeuille',
    createWalletButton: 'Creér nouveau portefeuille',
    restoreWalletButton: 'Restaurer depuis une sauvegarde',
  },
  // On CreateWalletScreen
  MnemonicExplanationModal: {
    paragraph1: [
      inline([
        normal(
          `Sur l'écran suivant, vous verrez une série de 15 mots aléatoires. `,
        ),
        normal('Ils constituent '),
        bold('la phrase de récupération de votre portefeuille. '),
        normal(`Elle peut être saisi dans n'importe qu'elle version `),
        normal('de Yoroi afin de sauvegarder ou de récupérer '),
        normal('les fonds de votre portefeuille ou bien votre clé privé.'),
      ]),
    ],
    paragraph2: [
      inline([
        normal('Assurez vous que '),
        bold('personne ne soit en train de regarder votre écran '),
        normal('à moins que nous vouliez que cette personne ai accès à vos fonds.'),
      ]),
    ],
    nextButton: `J'ai compris`,
  },
  WalletNameAndPasswordForm: {
    walletNameInput: {
      label: 'Nom portefeuille',
      errors: walletNameErrors,
    },
    newPasswordInput: {
      label: 'Mot de passe portefeuille',
    },
    repeatPasswordInput: {
      label: 'Répétez mot de passe',
      errors: {
        passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
      },
    },
    continueButton: 'Continuer',
  },
  PasswordStrengthIndicator: {
    passwordRequirementsNote: 'Le mot de passe doit contenir au moins:',
    passwordMinLength: '7 caractères',
    passwordUpperChar: '1 lettre majuscule',
    passwordLowerChar: '1 lettre minuscule',
    passwordNumber: '1 nombre',
    continueButton: 'Continuer',
    passwordBigLength: '12 caractères',
    or: 'Ou',
  },
  TransactionHistoryScreeen: {
    syncErrorBanner: {
      textWithoutRefresh: 'Problèmes de synchronisation.',
      textWithRefresh:
        'Problèmes de synchronisation. Tirer pour rafraichir',
    },
    availableFundsBanner: {
      label: common.availableFunds,
    },
    noTransactions: 'Pas de transactions pour le moment',
    transaction: {
      transactionType: {
        SENT: 'ADA envoyés',
        RECEIVED: 'ADA reçus',
        SELF: 'Mouvement interne',
        MULTI: 'Multi-tiers',
      },
      assuranceLevelHeader: 'Niveau de confiance:',
      assuranceLevel: {
        LOW: 'Faible',
        MEDIUM: 'Moyen',
        HIGH: 'Fort',
        PENDING: 'En cours',
        FAILED: 'Echoué',
      },
      fee: 'Frais:',
    },
    sendButton: 'Envoyer',
    receiveButton: 'Recevoir',
  },
  TransactionDetailsScreen: {
    transactionType: {
      SENT: 'Fonds envoyés',
      RECEIVED: 'Fonds reçus',
      SELF: 'Transactions internes',
      MULTI: 'Transactions multi-tiers',
    },
    fee: 'Frais: ',
    fromAddresses: `Adresse d'origine`,
    toAddresses: 'Addresses de destination',
    transactionId: 'ID transaction',
    txAssuranceLevel: 'Niveau de confiance de la transaction',
    formatConfirmations: (cnt: number) =>
      `${cnt} ${pluralizeEn(cnt, 'CONFIRMATION', 'CONFIRMATIONS')}`,
    formatOmittedCount: (cnt: number) => `+ ${cnt} omis`,
    addressPrefix: {
      receive: (idx: number) => `/${idx}`,
      change: (idx: number) => '/change',
      notMine: 'pas la mienne',
    },
  },
  SendAdaScreen: {
    title: 'Envoyer',
    fee: {
      label: 'Frais',
      notAvailable: '-',
    },
    balanceAfter: {
      label: 'Solde après',
      notAvailable: '-',
    },
    availableFundsBanner: {
      label: common.availableFunds,
      isFetching: 'Vérification solde...',
      notAvailable: '-',
    },
    addressInput: {
      label: 'Adresse',
      errors: {
        invalidAddress: 'Veuillez entrer une adresse valide',
      },
    },
    amountInput: {
      label: 'Montant',
      errors: {
        invalidAmount: {
          // Note(ppershing): first two should be auto-corrected
          // by the input control
          INVALID_AMOUNT: 'Veuilez entrer un montant valide',
          TOO_MANY_DECIMAL_PLACES: 'Veuilez entrer un montant valide',

          TOO_LARGE: 'montant trop élevé',
          NEGATIVE: 'le montant doit être positif',
        },
        insufficientBalance: 'Solde insuffisant pour effectuer cette transaction',
      },
    },
    continueButton: 'Continuer',
    errorBanners: {
      // note: offline banner is shared with TransactionHistory
      networkError:
        'Nous rencontrons un problème pendant la vérification de votre solde. ' +
        'Cliquez pour réessayer.',
      pendingOutgoingTransaction:
        'Vous ne pouvez pas envoyer une nouvelle transaction ' +
        `pendant qu'une autre est toujours en cours de validation`,
    },
  },
  ReadQRCodeAddressScreen: {
    title: `Scanner l'adresse du QR code`,
  },
  ConfirmSendAdaScreen: {
    title: 'Envoyer',
    amount: 'Montant',
    availableFundsBanner: {
      label: common.availableFunds,
    },
    balanceAfterTx: 'Solde après transaction',
    fees: 'Frais',
    password: 'Mot de passe du portefeuille',
    receiver: 'Destinataire',
    confirmButton: 'Confirmer',
    sendingModalTitle: 'Envoi de la transaction',
    pleaseWait: common.pleaseWait,
  },
  WalletCredentialsScreen: {
    title: 'Identifiants du portefeuille',
  },
  ChangeWalletNameScreen: {
    title: 'Changer nom du portefeuille',
    walletNameInput: {
      label: 'Nom portefeuille',
      errors: walletNameErrors,
    },
    changeButton: 'Changer nom',
  },
  ReceiveScreen: {
    title: 'Recevoir',
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
