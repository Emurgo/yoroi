import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()

  return {
    tapToView: intl.formatMessage(messages.tapToView),
    stakingRewardsReceived: intl.formatMessage(messages.stakingRewardsReceived),
    assetsReceived: intl.formatMessage(messages.assetsReceived),
    intraWalletTransactionSent: intl.formatMessage(
      messages.intraWalletTransactionSent,
    ),
    multipleAssetsReceived: intl.formatMessage(messages.multipleAssetsReceived),
    received: intl.formatMessage(messages.received),
    multipleAssetsSent: intl.formatMessage(messages.multipleAssetsSent),
    sent: intl.formatMessage(messages.sent),
    noNotifications: intl.formatMessage(messages.noNotifications),
    markAllAsRead: intl.formatMessage(messages.markAllAsRead),
    getImportantAlerts: intl.formatMessage(messages.getImportantAlerts),
    turnOnAlerts: intl.formatMessage(messages.turnOnAlerts),
    skip: intl.formatMessage(messages.skip),
    turnOnNotifications: intl.formatMessage(messages.turnOnNotifications),
  }
}

const messages = defineMessages({
  tapToView: {
    id: 'notifications.tapToView',
    defaultMessage: '!!!Tap to view',
  },
  stakingRewardsReceived: {
    id: 'notifications.stakingRewardsReceived',
    defaultMessage: '!!!Staking rewards received',
  },
  assetsReceived: {
    id: 'notifications.assetsReceived',
    defaultMessage: '!!!Assets received',
  },
  intraWalletTransactionSent: {
    id: 'notifications.intraWalletTransactionSent',
    defaultMessage: '!!!Intrawallet transaction sent',
  },
  multipleAssetsReceived: {
    id: 'notifications.multipleAssetsReceived',
    defaultMessage: '!!!Multiple assets received',
  },
  received: {
    id: 'notifications.received',
    defaultMessage: '!!!received',
  },
  multipleAssetsSent: {
    id: 'notifications.multipleAssetsSent',
    defaultMessage: '!!!Multiple assets sent',
  },
  sent: {
    id: 'notifications.sent',
    defaultMessage: '!!!sent',
  },
  noNotifications: {
    id: 'notifications.noNotifications',
    defaultMessage: '!!!No notifications yet',
  },
  markAllAsRead: {
    id: 'notifications.markAllAsRead',
    defaultMessage: '!!!Mark all as read',
  },
  getImportantAlerts: {
    id: 'notifications.getImportantAlerts',
    defaultMessage: '!!!Get important alerts',
  },
  turnOnAlerts: {
    id: 'notifications.turnOnAlerts',
    defaultMessage:
      '!!!Turn on notifications to get alerts and updates about your wallet.',
  },
  skip: {
    id: 'notifications.skip',
    defaultMessage: '!!!Skip',
  },
  turnOnNotifications: {
    id: 'notifications.turnOnNotifications',
    defaultMessage: '!!!Turn on notifications',
  },
})
