import React from 'react'
import {useIntl} from 'react-intl'

import {Banner} from '../../legacy/components/UiKit'
import globalMessages from '../../legacy/i18n/global-messages'

type Props = {
  showRefresh: boolean
  isOpen: boolean
}

export const SyncErrorBanner = ({showRefresh, isOpen}: Props) => {
  const intl = useIntl()

  if (!isOpen) return null

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
