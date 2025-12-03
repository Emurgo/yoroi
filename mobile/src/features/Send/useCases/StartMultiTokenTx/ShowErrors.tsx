import * as React from 'react'

import {useHasPendingTx} from '~/features/Transactions/hooks/useHasPendingTx'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'
import {useSync} from '@yoroi/wallet-manager/hooks/useSync'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Banner, ClickableBanner} from '~/ui/Banner/Banner'
import {Space} from '~/ui/Space/Space'

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
