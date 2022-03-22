import React from 'react'
import {useIntl} from 'react-intl'

import globalMessages from '../../legacy/i18n/global-messages'
import {Banner} from '../components'

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
