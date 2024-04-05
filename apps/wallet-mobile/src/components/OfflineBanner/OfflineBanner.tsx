import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {useSelectedWallet} from '../../features/Wallet/common/Context'
import {useIsOnline} from '../../yoroi-wallets/hooks'
import {Banner} from '../Banner'
import {LoadingBoundary} from '../Boundary'

export const OfflineBannerInner = () => {
  const intl = useIntl()
  const wallet = useSelectedWallet()
  const isOnline = useIsOnline(wallet)

  return isOnline ? null : <Banner error text={intl.formatMessage(messages.offline)} />
}

export const OfflineBanner = () => (
  <LoadingBoundary fallback={null}>
    <OfflineBannerInner />
  </LoadingBoundary>
)

const messages = defineMessages({
  offline: {
    id: 'components.uikit.offlinebanner.offline',
    defaultMessage: '!!!You are offline. Please check settings on your device.',
  },
})
