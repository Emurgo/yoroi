import {defineMessages, useIntl} from 'react-intl'

import globalMessages, {confirmationMessages, errorMessages, txLabels} from '../../../kernel/i18n/global-messages'
import LocalizableError from '../../../kernel/i18n/LocalizableError'

export const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    subTitle: intl.formatMessage(messages.subTitle),
    stakingKeyNotRegistered: intl.formatMessage(messages.stakingKeyNotRegistered),
    tip: intl.formatMessage(messages.tip),
    continueButton: intl.formatMessage(confirmationMessages.commonButtons.continueButton),
    iUnderstandButton: intl.formatMessage(confirmationMessages.commonButtons.iUnderstandButton),
    attention: intl.formatMessage(globalMessages.attention),
    registrationStart: intl.formatMessage(messages.registrationStart),
    votingStart: intl.formatMessage(messages.votingStart),
    votingEnd: intl.formatMessage(messages.votingEnd),
    votingResults: intl.formatMessage(messages.votingResults),
    step2Title: intl.formatMessage(messages.step2Title),
    step2Description: intl.formatMessage(messages.step2Description),
    checkbox: intl.formatMessage(messages.checkbox),
    step3Title: intl.formatMessage(messages.step3Title),
    step3Description: intl.formatMessage(messages.step3Description),
    signTransaction: intl.formatMessage(txLabels.signTransaction),
    errorMessage: (error: LocalizableError) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      intl.formatMessage({id: error.id, defaultMessage: error.defaultMessage}, (error as any).values),
    fees: intl.formatMessage(txLabels.fees),
    confirmationTitle: intl.formatMessage(messages.confirmationTitle),
    passwordSignDescription: intl.formatMessage(messages.passwordSignDescription),
    authOsInstructions: intl.formatMessage(messages.authOsInstructions),
    password: intl.formatMessage(txLabels.password),
    errorTitle: intl.formatMessage(errorMessages.generalTxError.title),
    generalErrorMessage: intl.formatMessage(errorMessages.generalTxError.message),
    confirm: intl.formatMessage(messages.confirm),
    step4Description: intl.formatMessage(messages.step4Description),
    step4Title: intl.formatMessage(messages.step4Title),
    completeButton: intl.formatMessage(confirmationMessages.commonButtons.completeButton),
    step4QrTitle: intl.formatMessage(messages.step4QrTitle),
    step4QrShareLabel: intl.formatMessage(messages.step4QrShareLabel),
    step4QrCopiedText: intl.formatMessage(messages.step4QrCopiedText),
    step4QrCheckbox: intl.formatMessage(messages.step4QrCheckbox),
  }
}

const messages = defineMessages({
  title: {
    id: 'components.catalyst.step1.title',
    defaultMessage: '!!!Intro',
  },
  subTitle: {
    id: 'components.catalyst.step1.subTitle',
    defaultMessage: '!!!Before you begin, make sure to\ndownload the Catalyst Voting App',
  },
  stakingKeyNotRegistered: {
    id: 'components.catalyst.step1.stakingKeyNotRegistered',
    defaultMessage:
      '!!!Catalyst voting rewards are sent to delegation accounts and your ' +
      'wallet does not seem to have a registered delegation certificate. If ' +
      'you want to receive voting rewards, you need to delegate your funds first.',
  },
  tip: {
    id: 'components.catalyst.step1.tip',
    defaultMessage:
      '!!!Make sure you know how to take a screenshot with your device, ' +
      'so that you can backup your catalyst QR code.',
  },
  registrationStart: {
    id: 'catalyst.registration.start',
    defaultMessage: '!!!Registration start',
  },
  votingStart: {
    id: 'catalyst.voting.start',
    defaultMessage: '!!!Voting start',
  },
  votingEnd: {
    id: 'catalyst.voting.end',
    defaultMessage: '!!!Voting end',
  },
  votingResults: {
    id: 'catalyst.voting.results',
    defaultMessage: '!!!Results',
  },
  step2Title: {
    id: 'components.catalyst.step2.title',
    defaultMessage: '!!!Write Down PIN',
  },
  step2Description: {
    id: 'components.catalyst.step2.description',
    defaultMessage:
      '!!!Please write down this PIN as you will need it every time you want to access the Catalyst Voting app',
  },
  checkbox: {
    id: 'components.catalyst.step2.checkbox',
    defaultMessage: '!!!I have written it down',
  },
  step3Title: {
    id: 'components.catalyst.step3.title',
    defaultMessage: '!!!Enter PIN',
  },
  step3Description: {
    id: 'components.catalyst.step3.description',
    defaultMessage: '!!!Please enter the PIN as you will need it every time you want to access the Catalyst Voting app',
  },
  confirmationTitle: {
    id: 'components.catalyst.confirmTx.title',
    defaultMessage: '!!!Confirm Registration',
  },
  passwordSignDescription: {
    id: 'components.catalyst.confirmTx.passwordSignDescription',
    defaultMessage:
      '!!!Confirm your voting registration and submit the certificate generated in previous step to the blockchain',
  },
  authOsInstructions: {
    id: 'components.catalyst.step4.bioAuthInstructions',
    defaultMessage: '!!!Please authenticate so that Yoroi can generate the required certificate for voting',
  },
  confirm: {
    id: 'global.actions.dialogs.commonbuttons.confirmButton',
    defaultMessage: '!!!Confirm',
  },
  step4Description: {
    id: 'components.catalyst.step4.description',
    defaultMessage:
      '!!!Screenshot or share this QR code and save it securely. Save the secret code as plain text in case you need to recreate the QR code.',
  },
  step4Title: {
    id: 'components.catalyst.step4.title',
    defaultMessage: '!!!Catalyst Code',
  },
  step4QrTitle: {
    id: 'components.catalyst.step4.qrTitle',
    defaultMessage: '!!!Backup Catalyst Code',
  },
  step4QrShareLabel: {
    id: 'components.catalyst.step4.qrShareLabel',
    defaultMessage: '!!!Share Code',
  },
  step4QrCopiedText: {
    id: 'components.catalyst.step4.qrCopiedText',
    defaultMessage: '!!!Code Copied',
  },
  step4QrCheckbox: {
    id: 'components.catalyst.step4.qrCheckbox',
    defaultMessage: '!!!I have take a screenshot of my QR code and saved my Catalyst secret code as a fallback.',
  },
})
