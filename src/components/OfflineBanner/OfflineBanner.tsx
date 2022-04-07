import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {useSelector} from 'react-redux'

import {isOnlineSelector} from '../../legacy/selectors'
import {Banner} from '../Banner'

export const OfflineBanner = () => {
  const intl = useIntl()
  const isOnline = useSelector(isOnlineSelector)

  return isOnline ? null : <Banner error text={intl.formatMessage(messages.offline)} />
}

const messages = defineMessages({
  offline: {
    id: 'components.uikit.offlinebanner.offline',
    defaultMessage: '!!!You are offline. Please check settings on your device.',
  },
})
