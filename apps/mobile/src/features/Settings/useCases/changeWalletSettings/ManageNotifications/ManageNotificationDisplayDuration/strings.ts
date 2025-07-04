import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()
  return {
    description: intl.formatMessage(messages.description),
    apply: intl.formatMessage(messages.apply),
    displayDuration: intl.formatMessage(messages.displayDuration),
    manual: intl.formatMessage(messages.manual),
    seconds: intl.formatMessage(messages.seconds),
    twoSeconds: intl.formatMessage(messages.twoSeconds),
    fourSeconds: intl.formatMessage(messages.fourSeconds),
    sixSeconds: intl.formatMessage(messages.sixSeconds),
    eightSeconds: intl.formatMessage(messages.eightSeconds),
    tenSeconds: intl.formatMessage(messages.tenSeconds),
    twelveSeconds: intl.formatMessage(messages.twelveSeconds),
    inputError: intl.formatMessage(messages.inputError),
  }
}

export const messages = defineMessages({
  description: {
    id: 'components.settings.manageNotificationDisplayDuration.description',
    defaultMessage:
      '!!!Adjust the display duration of in-app notifications to suit your preferences.',
  },
  apply: {
    id: 'components.settings.manageNotificationDisplayDuration.apply',
    defaultMessage: '!!!Apply',
  },
  displayDuration: {
    id: 'components.settings.manageNotificationDisplayDuration.displayDuration',
    defaultMessage: '!!!Display duration',
  },
  manual: {
    id: 'components.settings.manageNotificationDisplayDuration.manual',
    defaultMessage: '!!!Manual',
  },
  seconds: {
    id: 'components.settings.manageNotificationDisplayDuration.seconds',
    defaultMessage: '!!!seconds',
  },
  twoSeconds: {
    id: 'components.settings.manageNotificationDisplayDuration.twoSeconds',
    defaultMessage: '!!!2s',
  },
  fourSeconds: {
    id: 'components.settings.manageNotificationDisplayDuration.fourSeconds',
    defaultMessage: '!!!4s',
  },
  sixSeconds: {
    id: 'components.settings.manageNotificationDisplayDuration.sixSeconds',
    defaultMessage: '!!!6s',
  },
  eightSeconds: {
    id: 'components.settings.manageNotificationDisplayDuration.eightSeconds',
    defaultMessage: '!!!8s',
  },
  tenSeconds: {
    id: 'components.settings.manageNotificationDisplayDuration.tenSeconds',
    defaultMessage: '!!!10s',
  },
  twelveSeconds: {
    id: 'components.settings.manageNotificationDisplayDuration.twelveSeconds',
    defaultMessage: '!!!12s',
  },
  inputError: {
    id: 'components.settings.manageNotificationDisplayDuration.inputError',
    defaultMessage: '!!!Enter a value from 1 to 60.',
  },
})
