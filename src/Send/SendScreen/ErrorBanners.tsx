import React from 'react'

import {Banner, ClickableBanner} from '../../components'
import {useHasPendingTx, useSync} from '../../hooks'
import {useSelectedWallet} from '../../SelectedWallet'
import {useStrings} from './strings'

export const ErrorBanners = () => {
  const strings = useStrings()

  const wallet = useSelectedWallet()
  const hasPendingTx = useHasPendingTx(wallet)
  const {isLoading, error, sync} = useSync(wallet)

  if (error != null && !isLoading) {
    return <ClickableBanner error onPress={() => sync()} text={strings.errorBannerNetworkError} />
  } else if (hasPendingTx) {
    return <Banner error text={strings.errorBannerPendingOutgoingTransaction} />
  } else {
    return null
  }
}
