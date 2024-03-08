import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()

  return React.useRef({
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
    nextButton: intl.formatMessage(messages.nextButton),
    learnMoreButton: intl.formatMessage(messages.learnMoreButton),
    aboutRecoveryPhraseTitle: intl.formatMessage(messages.aboutRecoveryPhraseTitle),
    aboutRecoveryPhraseStepper: intl.formatMessage(messages.aboutRecoveryPhraseStepper),
    aboutRecoveryPhraseCardFirstItem: intl.formatMessage(messages.aboutRecoveryPhraseCardFirstItem),
    aboutRecoveryPhraseCardSecondItem: intl.formatMessage(messages.aboutRecoveryPhraseCardSecondItem),
    aboutRecoveryPhraseCardThirdItem: intl.formatMessage(messages.aboutRecoveryPhraseCardThirdItem),
    aboutRecoveryPhraseCardFourthItem: intl.formatMessage(messages.aboutRecoveryPhraseCardFourthItem),
    aboutRecoveryPhraseCardFifthItem: intl.formatMessage(messages.aboutRecoveryPhraseCardFifthItem),
    recoveryPhraseTitle: intl.formatMessage(messages.recoveryPhraseTitle),
    recoveryStepper: intl.formatMessage(messages.recoveryStepper),
    recoveryPhraseModalTitle: intl.formatMessage(messages.recoveryPhraseModalTitle),
    hideRecoveryPhraseButton: intl.formatMessage(messages.hideRecoveryPhraseButton),
    showRecoveryPhraseButton: intl.formatMessage(messages.showRecoveryPhraseButton),
    recoveryPhraseCardTitle: intl.formatMessage(messages.recoveryPhraseCardTitle),
    recoveryPhraseCardFirstItem: intl.formatMessage(messages.recoveryPhraseCardFirstItem),
    recoveryPhraseCardSecondItem: intl.formatMessage(messages.recoveryPhraseCardSecondItem),
    recoveryPhraseCardThirdItem: intl.formatMessage(messages.recoveryPhraseCardThirdItem),
    recoveryPhraseCardFourthItem: intl.formatMessage(messages.recoveryPhraseCardFourthItem),
    recoveryPhraseCardFifthItem: intl.formatMessage(messages.recoveryPhraseCardFifthItem),
    verifyRecoveryPhraseTitle: intl.formatMessage(messages.verifyRecoveryPhraseTitle),
    verifyRecoveryStepper: intl.formatMessage(messages.verifyRecoveryStepper),
    verifyRecoveryPhraseErrorMessage: intl.formatMessage(messages.verifyRecoveryPhraseErrorMessage),
    verifyRecoveryPhraseSuccessMessage: intl.formatMessage(messages.verifyRecoveryPhraseSuccessMessage),
  }).current
}

export const messages = Object.freeze(
  defineMessages({
    logoTitle: {
      id: 'components.walletinit.walletinitmenu.logo.title',
      defaultMessage: '!!!Yoroi',
    },
    logoSubtitle: {
      id: 'components.walletinit.walletinitmenu.logo.subtitle',
      defaultMessage: '!!!Light wallet for Cardano assets',
    },
    learnMoreButton: {
      id: 'components.walletinit.learnMoreInfo.button.title',
      defaultMessage: '!!!Learn more on Yoroi Zendesk',
    },
    continueButton: {
      id: 'components.walletinit.txnavigationbuttons.continueButton',
      defaultMessage: '!!!Continue',
    },
    nextButton: {
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
    aboutRecoveryPhraseStepper: {
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
    recoveryStepper: {
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
    verifyRecoveryStepper: {
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
  }),
)
