import {useNetInfo} from '@react-native-community/netinfo'
import React from 'react'

import {Banner, ClickableBanner, OfflineBanner} from '../../components'
import {useHasPendingTx, useUtxos} from '../../hooks'
import {useSelectedWallet} from '../../SelectedWallet'
import {useStrings} from './strings'

export const ErrorBanners = () => {
  const strings = useStrings()
  const netInfo = useNetInfo()
  const isOnline = netInfo.type !== 'none' && netInfo.type !== 'unknown'
  const wallet = useSelectedWallet()
  const hasPengingTx = useHasPendingTx(wallet)
  const {isLoading, refetch, error} = useUtxos(wallet)

  if (!isOnline) {
    return <OfflineBanner />
  } else if (error != null && !isLoading) {
    return <ClickableBanner error onPress={() => refetch()} text={strings.errorBannerNetworkError} />
  } else if (hasPengingTx) {
    return <Banner error text={strings.errorBannerPendingOutgoingTransaction} />
  } else {
    return null
  }
}
