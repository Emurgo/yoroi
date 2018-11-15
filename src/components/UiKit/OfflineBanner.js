// @flow

import React from 'react'
import {connect} from 'react-redux'

import {isOnlineSelector} from '../../selectors'
import Banner from './Banner'

const OfflineBanner = ({isOnline, offlineTranslation}) =>
  isOnline ? null : <Banner error text={offlineTranslation} />

export default connect(
  (state) => ({
    offlineTranslation: state.trans.global.notifications.offline,
    isOnline: isOnlineSelector(state),
  }),
  null,
)(OfflineBanner)
