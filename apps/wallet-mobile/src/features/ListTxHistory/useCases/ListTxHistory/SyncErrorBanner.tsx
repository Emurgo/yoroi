import React from 'react'

import {Banner} from '../../../../components'
import {useStrings} from '../../common/strings'

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
