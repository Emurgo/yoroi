import {defineMessages, useIntl} from 'react-intl'

import {messages as manageNotificationDisplayDurationMessages} from './ManageNotificationDisplayDuration/strings'

export const useStrings = () => {
  const intl = useIntl()
  return {
    manageDisplayDurationScreenTitle: intl.formatMessage(manageNotificationDisplayDurationMessages.displayDuration),
    inAppNotifications: intl.formatMessage(messages.inAppNotifications),
    displayDuration: intl.formatMessage(messages.displayDuration),
    pushNotifications: intl.formatMessage(messages.pushNotifications),
    goToSettings: intl.formatMessage(messages.goToSettings),
    enableNotificationsThroughSettings: intl.formatMessage(messages.enableNotificationsThroughSettings),
    notifications: intl.formatMessage(messages.notifications),
  }
}

const messages = defineMessages({
  inAppNotifications: {
    id: 'components.settings.walletsettingscreen.inAppNotifications',
    defaultMessage: '!!!In-app notifications',
  },
  displayDuration: {
    id: 'components.settings.walletsettingscreen.displayDuration',
    defaultMessage: '!!!Display duration',
  },
  pushNotifications: {
    id: 'components.settings.walletsettingscreen.pushNotifications',
    defaultMessage: '!!!Push notifications',
  },
  goToSettings: {
    id: 'components.settings.walletsettingscreen.goToSettings',
    defaultMessage: '!!!Go to Settings',
  },
  enableNotificationsThroughSettings: {
    id: 'components.settings.walletsettingscreen.enableNotificationsThroughSettings',
    defaultMessage: '!!!Enable notifications to get updates about your transactions and assets.',
  },
  notifications: {
    id: 'components.settings.walletsettingscreen.notifications',
    defaultMessage: '!!!Notifications',
  },
})
