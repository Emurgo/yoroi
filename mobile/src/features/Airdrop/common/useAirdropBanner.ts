import {time} from '@yoroi/common'
import {useNotificationManager} from '@yoroi/notifications'
import {Chain, Notifications} from '@yoroi/types'

import {useQuery, useQueryClient} from '@tanstack/react-query'

import {BannerIds, showBanner} from '~/features/Notifications/common/banners'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useWalletEvent} from '~/features/WalletManager/hooks/useWalletEvent'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'

import {useAirdropEligibility} from './useAirdropEligibility'

export const useAirdropBanner = () => {
  const walletManager = useWalletManager()
  const manager = useNotificationManager()
  const {
    selected: {network, wallet},
  } = walletManager
  
  const {allocations, totalRedeemableAmount, isLoading} = useAirdropEligibility()
  const strings = useStrings()
  const queryClient = useQueryClient()

  const queryKey = ['airdropBanner', wallet?.id, network] as const

  if (wallet) {
    useWalletEvent(wallet, 'utxos', () =>
      queryClient.invalidateQueries({queryKey}),
    )
  }

  useQuery({
    queryKey: [...queryKey, totalRedeemableAmount],
    enabled: !isLoading && wallet?.isMainnet === true && wallet?.isInitialized === true,
    staleTime: time.fiveMinutes,
    queryFn: async () => {
      const onMainnet = wallet?.isMainnet === true
      if (!onMainnet) return false

      // Skip if wallet is not initialized
      if (!wallet?.isInitialized) {
        return false
      }

      // Only show banner if there are eligible addresses with redeemable tokens
      if (allocations.length === 0 || totalRedeemableAmount === 0) {
        await manager.events.remove(BannerIds.Airdrop)
        queryClient.invalidateQueries({
          queryKey: ['receivedNotificationEvents'],
        })
        return false
      }

      logger.info('Airdrop banner prerequisites', {
        walletId: wallet?.id,
        allocationsCount: allocations.length,
        totalRedeemableAmount,
      })

      const last = (await manager.events.read()).find(
        (ev) =>
          ev.trigger === Notifications.Trigger.Banner &&
          ev.id === BannerIds.Airdrop,
      )

      // Format amount with commas
      const formattedAmount = totalRedeemableAmount.toLocaleString('en-US', {
        maximumFractionDigits: 2,
      })

      if (
        !last ||
        new Date(last.date).getTime() + time.oneWeek < Date.now()
      ) {
        showBanner({
          id: BannerIds.Airdrop,
          title: strings.airdrop.bannerTitle,
          body: strings.airdrop.bannerBody.replace('{amount}', formattedAmount),
          isRead: !!last,
        })
      }
      return true
    },
  })
}

