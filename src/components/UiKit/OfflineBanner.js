// @flow

import React from 'react'
import {connect} from 'react-redux'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import {isOnlineSelector} from '../../selectors'
import Banner from './Banner'

const messages = defineMessages({
  offline: {
    id: 'components.uikit.offlinebanner.offline',
    defaultMessage: '!!!You are offline. Please check settings on your device.',
  },
})

const OfflineBanner = ({isOnline, intl}: {intl: IntlShape} & Object) =>
  isOnline ? null : <Banner error text={intl.formatMessage(messages.offline)} />

export default injectIntl(
  connect(
    (state) => ({
      isOnline: isOnlineSelector(state),
    }),
    null,
  )(OfflineBanner),
)
