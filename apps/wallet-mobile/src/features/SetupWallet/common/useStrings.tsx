import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import globalMessages from '../../../i18n/global-messages'

export const useStrings = () => {
  const intl = useIntl()

  return React.useRef({
    passwordStrengthRequirement: (options: {requiredPasswordLength: number}) =>
      intl.formatMessage(messages.passwordStrengthRequirement, options),
    notFound: intl.formatMessage(messages.notFound),
    clearAll: intl.formatMessage(messages.clearAll),
    repeatPasswordInputLabel: intl.formatMessage(messages.repeatPasswordInputLabel),
    repeatPasswordInputError: intl.formatMessage(messages.repeatPasswordInputError),
    tooLong: intl.formatMessage(globalMessages.walletNameErrorTooLong),
    nameAlreadyTaken: intl.formatMessage(globalMessages.walletNameErrorNameAlreadyTaken),
    mustBeFilled: intl.formatMessage(globalMessages.walletNameErrorMustBeFilled),
    logoTitle: intl.formatMessage(messages.logoTitle),
    logoSubtitle: intl.formatMessage(messages.logoSubtitle),
    createWalletButtonCard: intl.formatMessage(messages.createWalletButtonCard),
    restoreWalletButtonCard: intl.formatMessage(messages.restoreWalletButtonCard),
    connectWalletButtonCard: intl.formatMessage(messages.connectWalletButtonCard),
    cardanoMainnet: intl.formatMessage(messages.cardanoMainnet),
    cardanoTestnet: intl.formatMessage(messages.cardanoTestnet),
    cardanoSanchonet: intl.formatMessage(messages.cardanoSanchonet),
    cardanoMainnetDescription: intl.formatMessage(messages.cardanoMainnetDescription),
    cardanoTestnetDescription: intl.formatMessage(messages.cardanoTestnetDescription),
    cardanoSanchonetDescription: intl.formatMessage(messages.cardanoSanchonetDescription),
    biometricDescription: intl.formatMessage(messages.biometricDescription),
    enableButton: intl.formatMessage(messages.enableButton),
    ignoreButton: intl.formatMessage(messages.ignoreButton),
    continueButton: intl.formatMessage(messages.continueButton),
    next: intl.formatMessage(messages.next),
    learnMore: intl.formatMessage(messages.learnMore),
    aboutRecoveryPhraseTitle: (options: {b: (content: React.ReactNode[]) => React.ReactNode}) =>
      intl.formatMessage(messages.aboutRecoveryPhraseTitle, {...options}),
    stepAboutRecoveryPhrase: intl.formatMessage(messages.stepAboutRecoveryPhrase),
    aboutRecoveryPhraseCardFirstItem: (options: {b: (content: React.ReactNode[]) => React.ReactNode}) =>
      intl.formatMessage(messages.aboutRecoveryPhraseCardFirstItem, {...options}),
    aboutRecoveryPhraseCardSecondItem: (options: {b: (content: React.ReactNode[]) => React.ReactNode}) =>
      intl.formatMessage(messages.aboutRecoveryPhraseCardSecondItem, {...options}),
    aboutRecoveryPhraseCardThirdItem: (options: {b: (content: React.ReactNode[]) => React.ReactNode}) =>
      intl.formatMessage(messages.aboutRecoveryPhraseCardThirdItem, {...options}),
    aboutRecoveryPhraseCardFourthItem: (options: {b: (content: React.ReactNode[]) => React.ReactNode}) =>
      intl.formatMessage(messages.aboutRecoveryPhraseCardFourthItem, {...options}),
    aboutRecoveryPhraseCardFifthItem: (options: {b: (content: React.ReactNode[]) => React.ReactNode}) =>
      intl.formatMessage(messages.aboutRecoveryPhraseCardFifthItem, {...options}),
    recoveryPhraseTitle: (options: {b: (content: React.ReactNode[]) => React.ReactNode}) =>
      intl.formatMessage(messages.recoveryPhraseTitle, {...options}),
    stepRecoveryPhrase: intl.formatMessage(messages.stepRecoveryPhrase),
    recoveryPhraseModalTitle: intl.formatMessage(messages.recoveryPhraseModalTitle),
    hideRecoveryPhraseButton: intl.formatMessage(messages.hideRecoveryPhraseButton),
    showRecoveryPhraseButton: intl.formatMessage(messages.showRecoveryPhraseButton),
    recoveryPhraseCardTitle: intl.formatMessage(messages.recoveryPhraseCardTitle),
    recoveryPhraseCardFirstItem: intl.formatMessage(messages.recoveryPhraseCardFirstItem),
    recoveryPhraseCardSecondItem: intl.formatMessage(messages.recoveryPhraseCardSecondItem),
    recoveryPhraseCardThirdItem: intl.formatMessage(messages.recoveryPhraseCardThirdItem),
    recoveryPhraseCardFourthItem: intl.formatMessage(messages.recoveryPhraseCardFourthItem),
    recoveryPhraseCardFifthItem: intl.formatMessage(messages.recoveryPhraseCardFifthItem),
    verifyRecoveryPhraseTitle: (options: {b: (content: React.ReactNode[]) => React.ReactNode}) =>
      intl.formatMessage(messages.verifyRecoveryPhraseTitle, {...options}),
    stepVerifyRecoveryPhrase: intl.formatMessage(messages.stepVerifyRecoveryPhrase),
    verifyRecoveryPhraseErrorMessage: intl.formatMessage(messages.verifyRecoveryPhraseErrorMessage),
    verifyRecoveryPhraseSuccessMessage: intl.formatMessage(messages.verifyRecoveryPhraseSuccessMessage),
    walletDetailsModalTitle: intl.formatMessage(messages.walletDetailsModalTitle),
    walletNameModalCardTitle: intl.formatMessage(messages.walletNameModalCardTitle),
    walletNameModalCardFirstItem: intl.formatMessage(messages.walletNameModalCardFirstItem),
    walletNameModalCardSecondItem: intl.formatMessage(messages.walletNameModalCardSecondItem),
    walletPasswordModalCardTitle: intl.formatMessage(messages.walletPasswordModalCardTitle),
    walletPasswordModalCardFirstItem: intl.formatMessage(messages.walletPasswordModalCardFirstItem),
    walletPasswordModalCardSecondItem: intl.formatMessage(messages.walletPasswordModalCardSecondItem),
    walletChecksumModalCardTitle: intl.formatMessage(messages.walletChecksumModalCardTitle),
    walletChecksumModalCardFirstItem: intl.formatMessage(messages.walletChecksumModalCardFirstItem),
    walletChecksumModalCardSecondItem: (checksum: string) =>
      intl.formatMessage(messages.walletChecksumModalCardSecondItem, {checksum}),
    walletChecksumModalCardThirdItem: intl.formatMessage(messages.walletChecksumModalCardThirdItem),
    stepWalletDetails: intl.formatMessage(messages.stepWalletDetails),
    walletDetailsTitle: (options: {b: (content: React.ReactNode[]) => React.ReactNode}) =>
      intl.formatMessage(messages.walletDetailsTitle, {...options}),
    walletDetailsPasswordHelper: intl.formatMessage(messages.walletDetailsPasswordHelper),
    walletDetailsNameInput: intl.formatMessage(messages.walletDetailsNameInput),
    walletDetailsPasswordInput: intl.formatMessage(messages.walletDetailsPasswordInput),
    walletDetailsConfirmPasswordInput: intl.formatMessage(messages.walletDetailsConfirmPasswordInput),
    header: intl.formatMessage(messages.header),
    addWalletButton: intl.formatMessage(messages.addWalletButton),
    addWalletOnShelleyButton: intl.formatMessage(messages.addWalletOnShelleyButton),
    deprecated: intl.formatMessage(globalMessages.deprecated),
    pleaseWait: intl.formatMessage(globalMessages.pleaseWait),
    loadingWallet: intl.formatMessage(messages.loadingWallet),
    supportTicketLink: intl.formatMessage(messages.supportTicketLink),
    invalidChecksum: intl.formatMessage(messages.invalidChecksum),
    validChecksum: intl.formatMessage(messages.validChecksum),
    stepRestoreWalletScreen: intl.formatMessage(messages.stepRestoreWalletScreen),
    wordNotFound: intl.formatMessage(messages.wordNotFound),
    choose15WordsMnemonicTitle: intl.formatMessage(messages.choose15WordsMnemonicTitle),
    choose24WordsMnemonicTitle: intl.formatMessage(messages.choose24WordsMnemonicTitle),
    restoreWalletScreenTitle: (options: {b: (content: React.ReactNode[]) => React.ReactNode}) =>
      intl.formatMessage(messages.restoreWalletScreenTitle, {...options}),
    restoreDuplicatedWalletModalTitle: intl.formatMessage(messages.restoreDuplicatedWalletModalTitle),
    restoreDuplicatedWalletModalText: intl.formatMessage(messages.restoreDuplicatedWalletModalText),
    restoreDuplicatedWalletModalButton: intl.formatMessage(messages.restoreDuplicatedWalletModalButton),
    preparingWallet: intl.formatMessage(messages.preparingWallet),
  }).current
}

export const messages = Object.freeze(
  defineMessages({
    notFound: {
      id: 'components.walletinit.createwallet.createwalletscreen.notFound',
      defaultMessage: '!!!Not found',
    },
    clearAll: {
      id: 'components.walletinit.createwallet.createwalletscreen.clearAll',
      defaultMessage: '!!!Clear all',
    },
    passwordStrengthRequirement: {
      id: 'components.walletinit.createwallet.createwalletscreen.passwordLengthRequirement',
      defaultMessage: '!!!Minimum characters',
    },
    repeatPasswordInputLabel: {
      id: 'components.walletinit.walletform.repeatPasswordInputLabel',
      defaultMessage: '!!!Repeat password',
    },
    repeatPasswordInputError: {
      id: 'components.walletinit.walletform.repeatPasswordInputError',
      defaultMessage: '!!!Passwords do not match',
    },
    logoTitle: {
      id: 'components.walletinit.walletinitmenu.logo.title',
      defaultMessage: '!!!Yoroi',
    },
    logoSubtitle: {
      id: 'components.walletinit.walletinitmenu.logo.subtitle',
      defaultMessage: '!!!Light wallet for Cardano assets',
    },
    learnMore: {
      id: 'components.walletinit.learnMoreInfo.button.title',
      defaultMessage: '!!!Learn more on Yoroi Zendesk',
    },
    continueButton: {
      id: 'components.walletinit.txnavigationbuttons.continueButton',
      defaultMessage: '!!!Continue',
    },
    next: {
      id: 'components.walletinit.txnavigationbuttons.nextButton',
      defaultMessage: '!!!Next',
    },
    createWalletButtonCard: {
      id: 'components.walletinit.walletinitmenu.createwalletbutton.title',
      defaultMessage: '!!!Create new wallet',
    },
    restoreWalletButtonCard: {
      id: 'components.walletinit.walletinitmenu.restorewalletbutton.title',
      defaultMessage: '!!!Restore Yoroi existing wallet',
    },
    connectWalletButtonCard: {
      id: 'components.walletinit.walletinitmenu.connectwalletbutton.title',
      defaultMessage: '!!!Connect hardware wallet device',
    },
    cardanoMainnet: {
      id: 'components.walletinit.walletinitmenu.cardanoMainnetbutton.title',
      defaultMessage: '!!!Cardano Mainnet',
    },
    cardanoTestnet: {
      id: 'components.walletinit.walletinitmenu.cardanoTestnetbutton.title',
      defaultMessage: '!!!Cardano Preprod Testnet',
    },
    cardanoSanchonet: {
      id: 'components.walletinit.walletinitmenu.cardanoSanchonetbutton.title',
      defaultMessage: '!!!Cardano SanchoNet',
    },
    cardanoMainnetDescription: {
      id: 'components.walletinit.walletinitmenu.cardanoMainnetbutton.description',
      defaultMessage: '!!!Works with real ADA',
    },
    cardanoTestnetDescription: {
      id: 'components.walletinit.walletinitmenu.cardanoTestnetbutton.description',
      defaultMessage: '!!!Works with test ADA (tADA)',
    },
    cardanoSanchonetDescription: {
      id: 'components.walletinit.walletinitmenu.cardanoSanchonetbutton.description',
      defaultMessage: '!!!Testnet for rolling out governance',
    },
    biometricDescription: {
      id: 'components.walletinit.biometricScreen.biometricDescription.description',
      defaultMessage:
        '!!!Use your device biometrics for a more convenient access to your Yoroi wallet and transaction confirmation',
    },
    enableButton: {
      id: 'components.walletinit.biometricScreen.enableButton.title',
      defaultMessage: '!!!Enable biometrics',
    },
    ignoreButton: {
      id: 'components.walletinit.biometricScreen.ignoreButton.title',
      defaultMessage: '!!!Recovery phrase is a unique combination of words',
    },
    aboutRecoveryPhraseTitle: {
      id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryPhrase.title',
      defaultMessage: '!!!Read this information carefully before saving your recovery phrase:',
    },
    stepAboutRecoveryPhrase: {
      id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryStepper.title',
      defaultMessage: '!!!About recovery phrase',
    },
    aboutRecoveryPhraseCardFirstItem: {
      id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryPhraseCard.firstItem',
      defaultMessage: '!!!Recovery phrase is the only way to access your wallet',
    },
    aboutRecoveryPhraseCardSecondItem: {
      id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryPhraseCard.secondItem',
      defaultMessage: '!!!If you lose your Recovery phrase, it will not be possible to recover your wallet',
    },
    aboutRecoveryPhraseCardThirdItem: {
      id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryPhraseCard.thirdItem',
      defaultMessage: '!!!You are the only person who knows and stores your Recovery phrase',
    },
    aboutRecoveryPhraseCardFourthItem: {
      id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryPhraseCard.fourthItem',
      defaultMessage: '!!!You are the only person who knows and stores your Recovery phrase',
    },
    aboutRecoveryPhraseCardFifthItem: {
      id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryPhraseCard.fifthItem',
      defaultMessage: '!!!Yoroi NEVER asks for your Recovery phrase. Watch out for scammers and impersonators',
    },
    recoveryPhraseTitle: {
      id: 'components.walletinit.recoveryPhrase.title',
      defaultMessage: '!!!Click “Show recovery phrase” below to reveal and save it. ',
    },
    stepRecoveryPhrase: {
      id: 'components.walletinit.recoveryPhrase.recoveryStepper.title',
      defaultMessage: '!!!Recovery phrase',
    },
    hideRecoveryPhraseButton: {
      id: 'components.walletinit.recoveryPhrase.hideRecoveryPhraseButton',
      defaultMessage: '!!!Hide recovery phrase',
    },
    showRecoveryPhraseButton: {
      id: 'components.walletinit.recoveryPhrase.showRecoveryPhraseButton',
      defaultMessage: '!!!Show recovery phrase',
    },
    recoveryPhraseModalTitle: {
      id: 'components.walletinit.recoveryPhrase.recoveryPhraseModal.title',
      defaultMessage: '!!!Tips',
    },
    recoveryPhraseCardTitle: {
      id: 'components.walletinit.recoveryPhrase.recoveryPhraseCard.title',
      defaultMessage: '!!!How to save your recovery phrase?',
    },
    recoveryPhraseCardFirstItem: {
      id: 'components.walletinit.recoveryPhrase.recoveryPhraseCard.firstItem',
      defaultMessage: '!!!Make sure no one is looking at your screen.',
    },
    recoveryPhraseCardSecondItem: {
      id: 'components.walletinit.recoveryPhrase.recoveryPhraseCard.secondItem',
      defaultMessage: '!!!DO NOT take a screenshot.',
    },
    recoveryPhraseCardThirdItem: {
      id: 'components.walletinit.recoveryPhrase.recoveryPhraseCard.thirdItem',
      defaultMessage:
        '!!!Write the recovery phrase on a piece of paper and store in a secure location like a safety deposit box.',
    },
    recoveryPhraseCardFourthItem: {
      id: 'components.walletinit.recoveryPhrase.recoveryPhraseCard.fourthItem',
      defaultMessage:
        '!!!It is recommended to have 2 or 3 copies of the recovery phrase in different secure locations.',
    },
    recoveryPhraseCardFifthItem: {
      id: 'components.walletinit.recoveryPhrase.recoveryPhraseCard.fifthItem',
      defaultMessage: '!!!DO NOT share the recovery phrase as this will allow anyone to access your assets and wallet.',
    },
    verifyRecoveryPhraseTitle: {
      id: 'components.walletinit.verifyRecoveryPhrase.title',
      defaultMessage: '!!!Select each word in the correct order to confirm your recovery phrase.',
    },
    stepVerifyRecoveryPhrase: {
      id: 'components.walletinit.verifyRecoveryPhrase.verifyRecoveryStepper.title',
      defaultMessage: '!!!Verify recovery phrase',
    },
    verifyRecoveryPhraseErrorMessage: {
      id: 'components.walletinit.verifyRecoveryPhrase.errorMessage',
      defaultMessage: '!!!Incorrect order. Try again',
    },
    verifyRecoveryPhraseSuccessMessage: {
      id: 'components.walletinit.verifyRecoveryPhrase.successMessage',
      defaultMessage: '!!!The recovery phrase is verified',
    },
    walletDetailsModalTitle: {
      id: 'components.walletinit.walletDetails.walletDetailsModalTitle.title',
      defaultMessage: '!!!Tips',
    },
    walletNameModalCardTitle: {
      id: 'components.walletinit.walletDetails.walletNameModalCardTitle.title',
      defaultMessage: '!!!What is wallet name',
    },
    walletNameModalCardFirstItem: {
      id: 'components.walletinit.walletDetails.walletNameModalCardItem.first',
      defaultMessage: '!!!It is a wallet identifier that helps you to easier find the exact wallet in your app',
    },
    walletNameModalCardSecondItem: {
      id: 'components.walletinit.walletDetails.walletNameModalCardItem.second',
      defaultMessage:
        '!!!You can have different wallet names for the same wallet account connected to different devices',
    },
    walletPasswordModalCardTitle: {
      id: 'components.walletinit.walletDetails.walletPasswordModalCardTitle.title',
      defaultMessage: '!!!What is password',
    },
    walletPasswordModalCardFirstItem: {
      id: 'components.walletinit.walletDetails.walletPasswordModalCardItem.first',
      defaultMessage: '!!!Password is an additional security layer used to confirm transactions from this device',
    },
    walletPasswordModalCardSecondItem: {
      id: 'components.walletinit.walletDetails.walletPasswordModalCardItem.second',
      defaultMessage:
        '!!!Both wallet name and password are stored locally, so you are only person who can change or restore it.',
    },
    walletChecksumModalCardTitle: {
      id: 'components.walletinit.walletDetails.walletChecksumModalCardTitle.title',
      defaultMessage: '!!!What is wallet checksum and plate number?',
    },
    walletChecksumModalCardFirstItem: {
      id: 'components.walletinit.walletDetails.walletChecksumModalCardItem.first',
      defaultMessage:
        '!!!Wallet checksum is a generic Blockie image that is generated to visually distinguish your wallet from others.',
    },
    walletChecksumModalCardSecondItem: {
      id: 'components.walletinit.walletDetails.walletChecksumModalCardItem.second',
      defaultMessage: '!!!Plate number {checksum} is a auto-generated sign of four letters and four digits.',
    },
    walletChecksumModalCardThirdItem: {
      id: 'components.walletinit.walletDetails.walletChecksumModalCardItem.third',
      defaultMessage: '!!!Checksum and plate number are unique to your wallet and represent your public key.',
    },
    stepWalletDetails: {
      id: 'components.walletinit.walletDetails.stepWalletDetails',
      defaultMessage: '!!!Wallet details',
    },
    walletDetailsTitle: {
      id: 'components.walletinit.walletDetails.walletDetailsTitle',
      defaultMessage: '!!!Add your wallet name and password. ',
    },
    walletDetailsPasswordHelper: {
      id: 'components.walletinit.walletDetails.walletDetailsPasswordHelper',
      defaultMessage: '!!!Combine letters, numbers and symbols to make it stronger',
    },
    walletDetailsNameInput: {
      id: 'components.walletinit.walletDetails.walletDetailsNameInput',
      defaultMessage: '!!!Enter wallet name',
    },
    walletDetailsPasswordInput: {
      id: 'components.walletinit.walletDetails.walletDetailsPasswordInput',
      defaultMessage: '!!!Enter password',
    },
    walletDetailsConfirmPasswordInput: {
      id: 'components.walletinit.walletDetails.walletDetailsConfirmPasswordInput',
      defaultMessage: '!!!Confirm password',
    },
    header: {
      id: 'components.walletselection.walletselectionscreen.header',
      defaultMessage: '!!!My wallets',
    },
    addWalletButton: {
      id: 'components.walletselection.walletselectionscreen.addWalletButton',
      defaultMessage: '!!!Add wallet',
    },
    addWalletOnShelleyButton: {
      id: 'components.walletselection.walletselectionscreen.addWalletOnShelleyButton',
      defaultMessage: '!!!Add wallet (Jormungandr ITN)',
    },
    loadingWallet: {
      id: 'components.walletselection.walletselectionscreen.loadingWallet',
      defaultMessage: '!!!Loading wallet',
    },
    supportTicketLink: {
      id: 'components.walletselection.walletselectionscreen.supportTicketLink',
      defaultMessage: '!!!Ask our support team',
    },
    invalidChecksum: {
      id: 'components.walletinit.restorewallet.restorewalletscreen.invalidchecksum',
      defaultMessage: '!!!Please enter valid mnemonic.',
    },
    validChecksum: {
      id: 'components.walletinit.restorewallet.restorewalletscreen.validchecksum',
      defaultMessage: '!!!The recovery phrase is verified',
    },
    stepRestoreWalletScreen: {
      id: 'components.walletinit.restorewallet.restorewalletscreen.stepRestoreWalletScreen',
      defaultMessage: '!!!Enter recovery phrase',
    },
    choose15WordsMnemonicTitle: {
      id: 'components.walletinit.restorewallet.choose15WordsMnemonicTitle',
      defaultMessage: '!!!15 word recovery phrase',
    },
    choose24WordsMnemonicTitle: {
      id: 'components.walletinit.restorewallet.choose24WordsMnemonicTitle',
      defaultMessage: '!!!24 word recovery phrase',
    },
    restoreWalletScreenTitle: {
      id: 'components.walletinit.restorewallet.restorewalletscreen.restoreWalletScreenTitle',
      defaultMessage: '!!!Add the recovery phrase you received upon your wallet creation process.',
    },
    restoreDuplicatedWalletModalTitle: {
      id: 'components.walletinit.restorewallet.restorewalletscreen.restoreDuplicatedWalletModalTitle',
      defaultMessage: '!!!This wallet is already added',
    },
    restoreDuplicatedWalletModalText: {
      id: 'components.walletinit.restorewallet.restorewalletscreen.restoreDuplicatedWalletModalText',
      defaultMessage:
        '!!!This wallet already exist on your device, You can open it or go back and restore another wallet.',
    },
    restoreDuplicatedWalletModalButton: {
      id: 'components.walletinit.restorewallet.restorewalletscreen.restoreDuplicatedWalletModalButton',
      defaultMessage: '!!!Open wallet',
    },
    preparingWallet: {
      id: 'components.walletinit.restorewallet.restorewalletscreen.preparingWallet',
      defaultMessage: '!!!Preparing your wallet...',
    },
    wordNotFound: {
      id: 'components.walletinit.restorewallet.restorewalletscreen.wordNotFound',
      defaultMessage: '!!!Word not found',
    },
  }),
)
