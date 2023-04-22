import React from 'react'
import {useIntl} from 'react-intl'

import {Banner} from '../components'
import globalMessages from '../i18n/global-messages'

type Props = {
  showRefresh: boolean
  isOpen: boolean
}

export const SyncErrorBanner = ({showRefresh, isOpen}: Props) => {
  const strings = useStrings()

  if (!isOpen) return null

  return (
    <Banner
      error
      text={showRefresh ? strings.syncErrorBannerTextWithRefresh : strings.syncErrorBannerTextWithoutRefresh}
    />
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    syncErrorBannerTextWithRefresh: intl.formatMessage(globalMessages.syncErrorBannerTextWithRefresh),
    syncErrorBannerTextWithoutRefresh: intl.formatMessage(globalMessages.syncErrorBannerTextWithoutRefresh),
  }
}
