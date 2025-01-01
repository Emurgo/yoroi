import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()

  return {
    tapToView: intl.formatMessage(messages.tapToView),
    stakingRewardsReceived: intl.formatMessage(messages.stakingRewardsReceived),
    assetsReceived: intl.formatMessage(messages.assetsReceived),
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
})
