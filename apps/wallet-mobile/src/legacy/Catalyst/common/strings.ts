import {defineMessages, useIntl} from 'react-intl'

import globalMessages, {confirmationMessages} from '../../../kernel/i18n/global-messages'

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
})
