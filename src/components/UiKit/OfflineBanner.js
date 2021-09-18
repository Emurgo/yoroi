// @flow

import React from 'react'
import {type IntlShape, defineMessages, injectIntl} from 'react-intl'
import {useSelector} from 'react-redux'

import {isOnlineSelector} from '../../selectors'
import Banner from './Banner'

const messages = defineMessages({
  offline: {
    id: 'components.uikit.offlinebanner.offline',
    defaultMessage: '!!!You are offline. Please check settings on your device.',
  },
})

const OfflineBanner = ({intl}: {intl: IntlShape}) => {
  const isOnline = useSelector(isOnlineSelector)

  return isOnline ? null : <Banner error text={intl.formatMessage(messages.offline)} />
}

export default injectIntl(OfflineBanner)
