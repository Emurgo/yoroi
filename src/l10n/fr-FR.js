// @flow
import {pluralizeEn, bold, normal, inline} from './util'
import {termsOfService} from './tos.fr-FR'

// Do not translate
const languages = {
  // TODO: Add back when chinese is available
  // chineseSimplified: '简体中文',
  // chineseTraditional: '繁體中文',
  english: 'English',
  japanese: '日本語',
  korean: '한국어',
  russian: 'Russian',
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
    currentLanguageName: 'Français',
  },
  confirmationDialogs: {
    logout: {
      title: 'Déconnexion',
      message: 'Voulez-vous vraiment vous déconnecter ?',
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
        `Nous avons détecté un changement de l'empreinte biométrique de votre téléphone. ` +
        'En conséquence, la validation facile des transactions a été désactivé ' +
        `et n'est disponible qu'avec votre mot de passe. ` +
        `Vous pouvez réactiver les transactions à l'aide du capteur biométrique dans les paramètres.`,
      yesButton: 'OK',
    },
    networkError: {
      title: 'Erreur réseau',
      message:
        'Erreur de connexion au serveur. ' +
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
    loginButton: 'Connexion',
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
        normal(`Elle peut être saisie dans n'importe qu'elle version `),
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
    fromAddresses: `Adresses d'origine`,
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
    title: 'Changer le nom du portefeuille',
    walletNameInput: {
      label: 'Nom portefeuille',
      errors: walletNameErrors,
    },
    changeButton: 'Changer nom',
  },
  ReceiveScreen: {
    title: 'Recevoir',
    infoText:
      'Partagez cette adresse pour recevoir des paiements. ' +
      'Afin de protéger votre vie privée, une nouvelle adresse ' +
      `est généré automatiquement à chaque fois que vous l'utilisez.`,
    generateButton: 'Générer une nouvelle adresse',
    cannotGenerate: 'Vous devez utiliser certaines de vos adresses',
    freshAddresses: 'Nouvelles adresses',
    usedAddresses: 'Adresses utilisées',
  },
  AddressDetailsModal: {
    walletAddress: 'Votre adresse de portefeuille',
    BIP32path: 'Chemin BIP32:',
    copyLabel: 'Copier adresse',
    copiedLabel: 'Copiée',
  },
  MnemonicShowScreen: {
    title: 'Phrase de récupération',
    mnemonicNote:
      'Veuillez vous assurer vous que vous avez écrit cette phrase sur papier ' +
      `et l'avez stocké dans un endroit sûr.` +
      'Vous aurez besoin de cette phrase pour utiliser et restaurer votre portefeuille. ' +
      'La phrase est sensible aux majuscules/minuscules.',
    confirmationButton: 'Je confirme avoir écrit ma phrase sur papier',
  },
  MnemonicBackupImportanceModal: {
    title: 'Phrase de récupération',
    keysStorageCheckbox:
      'Je comprends que mes clés privés sont stockés de manière sécurisé ' +
      `seulement sur cet appareil, et non pas sur les serveurs de l'entreprise`,
    newDeviceRecoveryCheckbox:
      `Je comprends que si l'application est transféré sur un autre appareil ` +
      `ou supprimé, mes fonds ne peuvent être récupérés qu'à l'aide de ma phrase de récupération ` +
      `que j'ai écrit sur papier et stocké dans un endroit sûr.`,
    confirmationButton: 'Je comprends',
  },
  MnemonicCheckScreen: {
    title: 'Phrase de récupération',
    instructions:
      'Touchez les mots dans le bon ordre pour confirmer votre phrase de récupération',
    mnemonicWordsInput: {
      label: 'Phrase de récupération',
      errors: {
        invalidPhrase: 'La phrase de récupération ne correspond pas',
      },
    },
    clearButton: 'Effacer',
    confirmButton: 'Confirmer',
  },
  RestoreWalletScreen: {
    title: 'Restaurer portefeuille',
    instructions:
      'Pour restaurer votre portefeuille, veuillez fournir la phrase de récupération ' +
      'que vous avez reçu lors de la création de votre portefeuille.',
    mnemonicInput: {
      label: 'Phrase de récupération',
      errors: {
        TOO_LONG: 'La phrase est trop longue. ',
        TOO_SHORT: 'La phrase est trop courte. ',
        INVALID_CHECKSUM: 'Veuillez vérifier la syntaxe de votre phrase (mnemonic).',
        UNKNOWN_WORDS: (words: Array<string>) => {
          const wordlist = words.map((word) => `'${word}'`).join(', ')
          const areInvalid = `${pluralizeEn(words.length, 'est', 'sont')} invalid`
          return `${wordlist} ${areInvalid}`
        },
      },
    },
    restoreButton: 'Restaurer portefeuille',
  },
  SettingsScreen: {
    WalletTab: {
      title: 'Paramètres',
      tabTitle: 'Portefeuille',

      switchWallet: 'Changer portefeuille',
      logout: 'Déconnexion',

      walletName: 'Nom portefeuille',

      security: 'Sécurité',
      changePassword: 'Changer mot de passe',
      easyConfirmation: 'Confirmation facile des transactions',

      removeWallet: 'Supprimer portefeuille',
    },
    ApplicationTab: {
      title: 'Paramètres',
      tabTitle: 'Application',

      language: 'Votre langue',

      security: 'Sécurité',
      changePin: 'Changer PIN',
      biometricsSignIn: 'Connexion avec capteur biométrique',

      crashReporting: 'Rapport de crash',
      crashReportingText:
        'Envoyers les rapports de crash a Emurgo. ' +
        'Les changements de ce paramètres seront effectifs ' +
        ` après le redémarrage de l'application.`,

      termsOfUse: `Termes d'utilisation`,
      support: 'Support',
    },
  },
  SupportScreen: {
    title: 'Support',
    faq: {
      label: 'Questions les plus fréquentes',
      description:
        'Si vous rencontrez des problèmes, veuillez consulter la FAQ ' +
        'sur le site web de Yoroi pour des guides de résolution technique.',
      url: 'https://yoroi-wallet.com/faq/',
    },
    report: {
      label: 'Signaler un problème',
      description:
        'Si la FAQ ne vous permet pas de résoudr le problème ' +
        `que vous rencontrez, merci d'utiliser la fonction de Support.`,
      url: 'https://yoroi-wallet.com/support/',
    },
  },
  TermsOfServiceScreen: {
    title: `Conditions d'utilisation`,
    content: termsOfService,
    aggreeClause: `J'accepte les conditions d'utilisation`,
    continueButton: 'Accepter',
    savingConsentModalTitle: 'Initialisation',
    pleaseWait: common.pleaseWait,
  },
  WalletSelectionScreen: {
    header: 'Vos portefeuille',
    addWalletButton: 'Ajouter portefeuille',
  },
  BiometricsLinkScreen: {
    enableFingerprintsMessage:
      `Veuillez d'abord activer le capteur d'empreinte de votre appareil`,
    notNowButton: 'Pas pour le moment',
    linkButton: 'Lien',
    headings: ['Utilisez votre empreinte'],
    subHeadings: ['pour un accès plus rapide et plus facile', ' du portefeuille Yoroi'],
  },
  // TODO(ppershing): this localization is a mess
  BiometricsAuthScreen: {
    authorizeOperation: `Autoriser l'opération`,
    useFallbackButton: 'Utiliser alternative',
    headings: ['Autoriser avec votre', 'empreinte'],
    cancelButton: 'Annuler',
    errors: {
      NOT_RECOGNIZED: `L'empreinte n'a pas été reconnue, veuillez réessayer`,
      SENSOR_LOCKOUT: 'Vous avez utilisé trop de doigts, le capteur a été désactivé',
      SENSOR_LOCKOUT_PERMANENT:
        `Vous avez désactivé de manière permanente votre capteur d'empreinte. Utilisez l'alternative.`,
      DECRYPTION_FAILED: `Le capteur d'empreinte a échoue, utilisez l'alternative`,
      UNKNOWN_ERROR: 'Erreur inconnue',
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
    walletName: 'Nom portefeuille',
    walletNameInput: 'Nom portefeuille',
    remove: 'Supprimer portefeuille',
    hasWrittenDownMnemonic:
      `J'ai écrit sur papier la phrase de récupération de ce portefeuille et je comprends` +
      'que je ne pourrais pas le récupérer sans celle-ci.',
  },

  ChoosePinScreen: {
    title: 'Enregistrer PIN',
    PinRegistrationForm: {
      PinInput: {
        title: 'Saisir le PIN',
        subtitle: 'Choisir un nouveau PIN pour un accès rapide au portefeuille.',
      },
      PinConfirmationInput: {
        title: 'Répéter PIN',
      },
    },
  },
  ChangePasswordScreen: {
    title: 'Changer le mote de passe du portefeuille',
    oldPasswordInput: {
      label: 'Mot de passe actuel',
    },
    newPasswordInput: {
      label: 'Nouveau mot de passe',
    },
    repeatPasswordInput: {
      label: 'Répéter mot de passe',
      errors: {
        passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
      },
    },
    continueButton: 'Changer mot de passe',
  },
  ChangeCustomPinScreen: {
    title: 'Changer PIN',
    CurrentPinInput: {
      title: 'Saisir PIN',
      subtitle: 'Saisir PIN actuel',
    },
    PinRegistrationForm: {
      PinInput: {
        title: 'Saisir PIN',
        subtitle: 'Choisir nouveau PIN pour un accès rapide au portefeuille.',
      },
      PinConfirmationInput: {
        title: 'Répéter PIN',
      },
    },
  },
  EasyConfirmationScreen: {
    title: 'Confirmation facile',
    enable: {
      heading:
        `Cette option vous permet d'effectuer des transactions d'ADA ` +
        'depuis votre portefeuille en confirmant votre empreinte ou bien ' +
        'votre visage avec une alternative standard du système. ' +
        `Cela rend votre portefeuille moins sécurisé. C'est un compris ` +
        `entre l'expérience utilisateur et la sécurité!`,
      warning:
        'Assurez vous de vous souvenir de votre mot de passe maître. Vous pourriez en avoir besoin ' +
        'si les informations biométriques sont supprimées de cet appareil.',
      masterPassword: 'Mot de passe maître',
      enableButton: 'Activer',
    },
    disable: {
      heading:
        'En désactivant cette option vous ne pourrez dépenser vos ADA ' +
        `qu'a l'aide du mot de passe maître.`,
      disableButton: 'Désactiver',
    },
  },
  Biometry: {
    approveTransaction: `Autoriser avec l'empreinte`,
    subtitle: '', // subtitle for the biometry dialog Andoid 9
    description: '', // description of the biometry dialog Android 9
    cancelButton: 'Annuler',
  },
}

export default l10n
