// @flow

import React, {memo} from 'react'
import {useIntl} from 'react-intl'

import globalMessages from '../../../i18n/global-messages'
import {Banner} from '../../UiKit'

type Props = {|
  showRefresh: boolean,
|}

const SyncErrorBanner = ({showRefresh}: Props) => {
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

export default memo<Props>(SyncErrorBanner)
