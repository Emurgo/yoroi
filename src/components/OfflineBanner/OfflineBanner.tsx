import {useNetInfo} from '@react-native-community/netinfo'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {Banner} from '../Banner'

export const OfflineBanner = () => {
  const intl = useIntl()
  const netInfo = useNetInfo()
  const isOnline = netInfo.type !== 'none' && netInfo.type !== 'unknown'

  return isOnline ? null : <Banner error text={intl.formatMessage(messages.offline)} />
}

const messages = defineMessages({
  offline: {
    id: 'components.uikit.offlinebanner.offline',
    defaultMessage: '!!!You are offline. Please check settings on your device.',
  },
})
