import React from 'react'

import {Banner, ClickableBanner} from '../../components'
import {useHasPendingTx, useUtxos} from '../../hooks'
import {useSelectedWallet} from '../../SelectedWallet'
import {useStrings} from './strings'

export const ErrorBanners = () => {
  const strings = useStrings()

  const wallet = useSelectedWallet()
  const hasPendingTx = useHasPendingTx(wallet)
  const {isLoading, refetch, error} = useUtxos(wallet)

  if (error != null && !isLoading) {
    return <ClickableBanner error onPress={() => refetch()} text={strings.errorBannerNetworkError} />
  } else if (hasPendingTx) {
    return <Banner error text={strings.errorBannerPendingOutgoingTransaction} />
  } else {
    return null
  }
}
