import {useNetInfo} from '@react-native-community/netinfo'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {Banner, ClickableBanner, OfflineBanner} from '../../components'
import {useHasPendingTx} from '../../hooks'
import {isFetchingUtxosSelector, lastUtxosFetchErrorSelector} from '../../legacy/selectors'
import {fetchUTXOs} from '../../legacy/utxo'
import {useSelectedWallet} from '../../SelectedWallet'
import {useStrings} from './strings'

export const ErrorBanners = () => {
  const strings = useStrings()
  const netInfo = useNetInfo()
  const isOnline = netInfo.type !== 'none' && netInfo.type !== 'unknown'
  const wallet = useSelectedWallet()
  const hasPengingTx = useHasPendingTx(wallet)
  const lastFetchingError = useSelector(lastUtxosFetchErrorSelector)
  const isFetchingBalance = useSelector(isFetchingUtxosSelector)
  const dispatch = useDispatch()

  if (!isOnline) {
    return <OfflineBanner />
  } else if (lastFetchingError != null && !isFetchingBalance) {
    return <ClickableBanner error onPress={() => dispatch(fetchUTXOs())} text={strings.errorBannerNetworkError} />
  } else if (hasPengingTx) {
    return <Banner error text={strings.errorBannerPendingOutgoingTransaction} />
  } else {
    return null
  }
}
