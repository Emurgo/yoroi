import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {useIsOnline} from '../../hooks'
import {useSelectedWallet} from '../../SelectedWallet'
import {Banner} from '../Banner'

export const OfflineBanner = () => {
  const intl = useIntl()
  const wallet = useSelectedWallet()
  const isOnline = useIsOnline(wallet)

  return isOnline ? null : <Banner error text={intl.formatMessage(messages.offline)} />
}

const messages = defineMessages({
  offline: {
    id: 'components.uikit.offlinebanner.offline',
    defaultMessage: '!!!You are offline. Please check settings on your device.',
  },
})
