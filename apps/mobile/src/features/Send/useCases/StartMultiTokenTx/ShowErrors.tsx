import React from 'react'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/features/common/strings'
import {Banner, ClickableBanner} from '~/ui/Banner/Banner'
import {Spacer} from '~/ui/Spacer/Spacer'
import {useHasPendingTx, useSync} from '~/wallets/hooks'

export const ShowErrors = () => {
  const strings = useStrings()

  const {wallet} = useSelectedWallet()
  const hasPendingTx = useHasPendingTx({wallet})
  const {isLoading, error, sync} = useSync(wallet)

  if (error != null && !isLoading) {
    return (
      <>
        <ClickableBanner
          error
          onPress={() => sync()}
          text={strings.errorBannerNetworkError}
        />

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
