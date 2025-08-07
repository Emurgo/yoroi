import * as React from 'react'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useSync} from '~/features/WalletManager/hooks/useSync'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Banner, ClickableBanner} from '~/ui/Banner/Banner'
import {Space} from '~/ui/Space/Space'
import {useHasPendingTx} from '~/wallets/hooks'

export const ShowErrors = () => {
  const strings = useStrings()

  const {wallet} = useSelectedWallet()
  const hasPendingTx = useHasPendingTx({wallet})
  const {isPending, error, sync} = useSync(wallet)

  if (error != null && !isPending) {
    return (
      <>
        <ClickableBanner
          error
          onPress={() => sync()}
          text={strings.send.errorBannerNetworkError}
        />

        <Space.Height.md />
      </>
    )
  } else if (hasPendingTx) {
    return (
      <>
        <Banner
          error
          text={strings.send.errorBannerPendingOutgoingTransaction}
        />

        <Space.Height.md />
      </>
    )
  }

  return null
}
