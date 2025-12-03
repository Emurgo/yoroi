import {time} from '@yoroi/common'
import {useNotificationManager} from '@yoroi/notifications'
import {Chain, Notifications} from '@yoroi/types'

import {useQuery, useQueryClient} from '@tanstack/react-query'
import * as React from 'react'

import {BannerIds, showBanner} from '~/features/Notifications/common/banners'
import {useBalances} from '~/features/Portfolio/common/hooks/useBalances'
import {useWalletManager} from '@yoroi/wallet-manager/context/WalletManagerProvider'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'
import {useWalletEvent} from '@yoroi/wallet-manager/hooks/useWalletEvent'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Amounts, Quantities} from '@yoroi/cardano-wallet/utils/utils'

export const useBuyCryptoBanner = () => {
  const {wallet} = useSelectedWallet()
  const manager = useNotificationManager()
  const {
    selected: {network},
  } = useWalletManager()

  const strings = useStrings()

  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(
    balances,
    wallet.portfolioPrimaryTokenInfo.id,
  )
  const hasZeroPt = Quantities.isZero(primaryAmount.quantity)

  const queryKey = ['buyCryptoBanner', wallet?.id, network] as const
  const queryClient = useQueryClient()

  useWalletEvent(wallet, 'utxos', () =>
    queryClient.invalidateQueries({queryKey}),
  )

  React.useEffect(() => {
    queryClient.invalidateQueries({queryKey})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network])

  useQuery({
    queryKey,
    staleTime: time.fiveMinutes,
    queryFn: async () => {
      if (hasZeroPt) {
        const last = (await manager.events.read()).find(
          (ev) =>
            ev.trigger === Notifications.Trigger.Banner &&
            ev.id === BannerIds.BuyCrypto,
        )

        const lastPreprod = (await manager.events.read()).find(
          (ev) =>
            ev.trigger === Notifications.Trigger.Banner &&
            ev.id === BannerIds.TestAda,
        )

        if (network === Chain.Network.Preprod) {
          manager.events.remove(BannerIds.BuyCrypto)
          if (
            !lastPreprod ||
            new Date(lastPreprod.date).getTime() + time.oneMonth < Date.now()
          ) {
            showBanner({
              id: BannerIds.TestAda,
              title: strings.exchange.preprodFaucetBannerTitle,
              body: strings.exchange.preprodFaucetBannerText,
              isRead: !!lastPreprod,
            })
          }
        } else {
          manager.events.remove(BannerIds.TestAda)
          if (
            !last ||
            new Date(last.date).getTime() + time.oneMonth < Date.now()
          ) {
            showBanner({
              id: BannerIds.BuyCrypto,
              title: strings.exchange.needMoreCrypto,
              body: strings.exchange.ourTrustedPartners,
              isRead: !!last,
            })
          }
        }
        return true
      } else {
        await manager.events.remove(BannerIds.BuyCrypto)
        await manager.events.remove(BannerIds.TestAda)
        queryClient.invalidateQueries({
          queryKey: ['receivedNotificationEvents'],
        })
        return false
      }
    },
  })
}
