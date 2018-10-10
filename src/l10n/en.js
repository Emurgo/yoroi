// @flow
import {pluralizeEn} from './util'

const language = {
  chineseSimplified: '简体中文',
  chineseTraditional: '繁體中文',
  english: 'English',
  japanese: '日本語',
  korean: '한국어',
}

const datetime = {
  today: 'Today',
  yesterday: 'Yesterday',
}

const l10n = {
  global: {
    language,
    datetime,
  },
  languageSelectScreen: {
    selectLanguage: 'SELECT YOUR LANGAUAGE',
    continue: 'CONTINUE',
  },
  txHistoryScreen: {
    transactionType: {
      SENT: 'ADA sent',
      RECEIVED: 'ADA received',
    },
    assuranceLevelHeader: 'Assurance level:',
    assuranceLevel: {
      LOW: 'Low',
      MEDIUM: 'Medium',
      HIGH: 'High',
    },
    transactionDetails: {
      fromAddresses: 'From Addresses',
      toAddresses: 'To Addresses',
      transactionId: 'Transaction ID',
      txAssuranceLevel: 'Transaction assurance level',
      transactionHeader: {
        SENT: 'ADA sent',
        RECEIVED: 'ADA received',
      },
      formatConfirmations: (cnt: number) =>
        `${cnt} ${pluralizeEn(cnt, 'CONFIRMATION', 'CONFIRMATIONS')}`,
    },
  },
  walletInitScreen: {
    createWallet: 'CREATE A NEW WALLET',
    restoreWallet: 'RESTORE WALLET FROM BACKUP',
  },
  walletDescription: {
    line1: 'Yoroi is Web Light Wallet for Cardano',
    line2: 'Secure Fast Simple',
    byEmurgo: 'By',
  },
  createWallet: {
    title: 'Create a new wallet',
    nameLabel: 'Wallet name',
    passwordLabel: 'Password',
    passwordConfirmationLabel: 'Password confirmation',
    passwordRequirementsNote: 'Note: Password must be....',
    createButton: 'CREATE PERSONAL WALLET',
  },
  receiveScreen: {
    title: 'Receive',
    warning: {
      line1: 'Share this wallet to receive payments.',
      line2: 'To protect your privacy, new address are',
      line3: 'generated automatically once you use them.',
    },
    address: 'Your wallet address',
    addresses: 'Your wallet addresses',
  },
  recoveryPhraseConfirmationDialog: {
    title: 'Recovery phrase',
    keysStorageCheckbox: 'I understand that my secret keys are held securely on this device only,\
 not on the company`s servers',
    newDeviceRecoveryCheckbox: 'I understand that if this application is moved to another device\
 or delete, my money can be only recovered with the backup phrase that I have written down\
 and saved in secure place.',
    confirmationButton: 'I UNDERSTAND',
  },
  recoveryPhraseConfirmationScreen: {
    title: 'Recovery phrase',
    instructions: 'Tap each word in the correct order to verify your recovery phrase',
    inputLabel: 'Recovery phrase',
    clearButton: 'CLEAR',
    confirmButton: 'CONFIRM',
  },
  recoveryPhraseDialog: {
    title: 'Recovery phrase',
    paragraph1: 'On the following screen, you will see a set of 15 random words. This\
 is your wallet backup phrase. It can be entered in version of Yoroi in order\
 to back up or restore your wallet`s funds and private key.',
    paragraph2: 'Make sure nobody looks into your screen unless you want them to have\
 access to your funds.',
    nextButton: 'NEXT',
  },
  recoveryPhraseScreen: {
    title: 'Recovery phrase',
    mnemonicNote: 'Please, make sure you have carefully written down your recovery phrase\
 somewhere safe. You will need this phrase to use and restore your wallet. Phrase\
 is case sensitive.',
    confirmationButton: 'YES, I`VE WRITTEN IT DOWN',
  },
  restoreWalletScreen: {
    title: 'Restore wallet',
    restoreButton: 'RESTORE WALLET',
  },
  txHistoryNavigationButtons: {
    sendButton: 'SEND',
    receiveButton: 'RECEIVE',
  },
}

export default l10n
