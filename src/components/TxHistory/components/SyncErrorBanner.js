// @flow

import React from 'react'
import {useIntl} from 'react-intl'

import globalMessages from '../../../i18n/global-messages'
import {Banner} from '../../UiKit'

const SyncErrorBanner = ({showRefresh}: {showRefresh: any}) => {
  const intl = useIntl()

  return (
    <Banner
      error
      text={
        showRefresh
          ? intl.formatMessage(globalMessages.syncErrorBannerTextWithRefresh)
          : intl.formatMessage(globalMessages.syncErrorBannerTextWithoutRefresh)
      }
    />
  )
}

export default SyncErrorBanner
