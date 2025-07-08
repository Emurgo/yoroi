import {useQuery, useQueryClient} from '@tanstack/react-query'
import {time} from '@yoroi/common'
import {useNotificationManager} from '@yoroi/notifications'
import {Chain, Notifications} from '@yoroi/types'
import * as React from 'react'

import {useBalances} from '../../../wallets/hooks'
import {Amounts, Quantities} from '../../../wallets/utils/utils'
import {BannerIds, showBanner} from '../../Notifications/common/banners'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'
import {useStrings} from './useStrings'

export const useBuyCryptoBanner = () => {
  const {wallet} = useSelectedWallet()
  const manager = useNotificationManager()
  const {
    selected: {network},
  } = useWalletManager()

  const strings = useStrings()

  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(balances, wallet.portfolioPrimaryTokenInfo.id)
  const hasZeroPt = Quantities.isZero(primaryAmount.quantity)

  const queryKey = ['buyCryptoBanner', wallet?.id, network]
  const queryClient = useQueryClient()

  useWalletEvent(wallet, 'utxos', () => queryClient.invalidateQueries(queryKey))

  React.useEffect(() => {
    queryClient.invalidateQueries(queryKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network])

  useQuery({
    queryKey,
    staleTime: time.fiveMinutes,
    queryFn: async () => {
      if (hasZeroPt) {
        const last = (await manager.events.read()).find(
          (ev) => ev.trigger === Notifications.Trigger.Banner && ev.id === BannerIds.BuyCrypto,
        )

        const lastPreprod = (await manager.events.read()).find(
          (ev) => ev.trigger === Notifications.Trigger.Banner && ev.id === BannerIds.TestAda,
        )

        if (network === Chain.Network.Preprod) {
          manager.events.remove(BannerIds.BuyCrypto)
          if (!lastPreprod || new Date(lastPreprod.date).getTime() + time.oneMonth < Date.now()) {
            showBanner({
              id: BannerIds.TestAda,
              title: strings.preprodFaucetBannerTitle,
              body: strings.preprodFaucetBannerText,
              isRead: !!lastPreprod,
            })
          }
        } else {
          manager.events.remove(BannerIds.TestAda)
          if (!last || new Date(last.date).getTime() + time.oneMonth < Date.now()) {
            showBanner({
              id: BannerIds.BuyCrypto,
              title: strings.needMoreCrypto,
              body: strings.ourTrustedPartners,
              isRead: !!last,
            })
          }
        }
        return true
      } else {
        manager.events.remove(BannerIds.BuyCrypto)
        manager.events.remove(BannerIds.TestAda)
        return false
      }
    },
  })
}
