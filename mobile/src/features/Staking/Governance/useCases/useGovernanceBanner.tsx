import {time} from '@yoroi/common'
import {useNotificationManager} from '@yoroi/notifications'
import {Branded, Notifications} from '@yoroi/types'

import {useQuery, useQueryClient} from '@tanstack/react-query'

import {BannerIds, showBanner} from '~/features/Notifications/common/banners'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useWalletEvent} from '~/features/WalletManager/hooks/useWalletEvent'
import {minAdaForGovernanceBanner} from '~/kernel/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {governanceQueryKeys, notificationQueryKeys} from '~/queries'

import {useGovernanceParticipation} from '../common/helpers'

export const useGovernanceBanner = () => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const manager = useNotificationManager()
  // Use selector hook instead of full context to prevent unnecessary re-renders
  const {network} = useSelectedNetwork()
  const {isParticipating, isLoading} = useGovernanceParticipation()

  const queryKey = governanceQueryKeys.banner(wallet?.id, network)
  const queryClient = useQueryClient()

  useWalletEvent(wallet, 'utxos', () =>
    queryClient.invalidateQueries({queryKey}),
  )

  useQuery({
    queryKey: [...queryKey, isParticipating],
    enabled: !isLoading,
    staleTime: time.fiveMinutes,
    queryFn: async () => {
      const balance = wallet?.balanceManager.getPrimaryBalance()
      const adaLovelace = BigInt(balance?.quantity ?? Branded.ZERO_QUANTITY)
      const hasEnoughAda = adaLovelace > minAdaForGovernanceBanner
      logger.debug('Governance banner prerequisites ', {
        walletId: wallet?.id,
        isParticipating,
        balanceLovelace: adaLovelace.toString(),
      })
      // show banner only if NOT participating and balance > 5 ADA
      const onMainnet = wallet?.isMainnet === true
      if (!onMainnet) return false

      if (isParticipating) {
        await manager.events.remove(BannerIds.GovernanceParticipation)
        queryClient.invalidateQueries({
          queryKey: notificationQueryKeys.events(),
        })
        return false
      }

      if (!hasEnoughAda) {
        await manager.events.remove(BannerIds.GovernanceParticipation)
        queryClient.invalidateQueries({
          queryKey: notificationQueryKeys.events(),
        })
        return false
      }

      const last = (await manager.events.read()).find(
        (ev) =>
          ev.trigger === Notifications.Trigger.Banner &&
          ev.id === BannerIds.GovernanceParticipation,
      )
      if (!last || new Date(last.date).getTime() + time.oneMonth < Date.now()) {
        showBanner({
          id: BannerIds.GovernanceParticipation,
          title: strings.staking.newToGovernanceTitle,
          body: strings.staking.newToGovernanceText,
          isRead: !!last,
        })
      }
      return true
    },
  })
}
