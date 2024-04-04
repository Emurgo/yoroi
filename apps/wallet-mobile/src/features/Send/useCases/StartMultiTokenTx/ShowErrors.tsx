import React from 'react'

import {Banner, ClickableBanner, Spacer} from '../../../../components'
import {useHasPendingTx, useSync} from '../../../../yoroi-wallets/hooks'
import {useSelectedWallet} from '../../../AddWallet/common/Context'
import {useStrings} from '../../common/strings'

export const ShowErrors = () => {
  const strings = useStrings()

  const wallet = useSelectedWallet()
  const hasPendingTx = useHasPendingTx(wallet)
  const {isLoading, error, sync} = useSync(wallet)

  if (error != null && !isLoading) {
    return (
      <>
        <ClickableBanner error onPress={() => sync()} text={strings.errorBannerNetworkError} />

        <Spacer height={16} />
      </>
    )
  } else if (hasPendingTx) {
    return (
      <>
        <Banner error text={strings.errorBannerPendingOutgoingTransaction} />

        <Spacer height={16} />
      </>
    )
  }

  return null
}
