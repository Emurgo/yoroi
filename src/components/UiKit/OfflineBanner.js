// @flow

import React from 'react'
import {useSelector} from 'react-redux'
import {useIntl, defineMessages} from 'react-intl'

import {isOnlineSelector} from '../../selectors'
import Banner from './Banner'

const messages = defineMessages({
  offline: {
    id: 'components.uikit.offlinebanner.offline',
    defaultMessage: '!!!You are offline. Please check settings on your device.',
  },
})

const OfflineBanner = () => {
  const intl = useIntl()
  const isOnline = useSelector(isOnlineSelector)

  return isOnline ? null : <Banner error text={intl.formatMessage(messages.offline)} />
}

export default OfflineBanner
