import {time} from '@yoroi/common'
import {useNotificationManager} from '@yoroi/notifications'
import {Chain, Notifications} from '@yoroi/types'

import {useQuery, useQueryClient} from '@tanstack/react-query'

import {BannerIds, showBanner} from '~/features/Notifications/common/banners'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useWalletEvent} from '~/features/WalletManager/hooks/useWalletEvent'
import {minAdaForGovernanceBanner} from '~/kernel/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'

import {useGovernanceParticipation} from '../common/helpers'

export const useGovernanceBanner = () => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const manager = useNotificationManager()
  const {
    selected: {network},
  } = useWalletManager()
  const {isParticipating, isLoading} = useGovernanceParticipation()

  const queryKey = ['governanceBanner', wallet?.id, network]
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
      const adaLovelace = BigInt(balance?.quantity ?? '0')
      const hasEnoughAda = adaLovelace > minAdaForGovernanceBanner
      logger.info('Governance banner prerequisites ', {
        walletId: wallet?.id,
        isParticipating,
        balanceLovelace: adaLovelace.toString(),
      })
      // show banner only if NOT participating and balance > 5 ADA
      const onMainnet = network === Chain.Network.Mainnet
      if (!onMainnet) return false

      if (isParticipating) {
        await manager.events.remove(BannerIds.GovernanceParticipation)
        queryClient.invalidateQueries({
          queryKey: ['receivedNotificationEvents'],
        })
        return false
      }

      if (!hasEnoughAda) {
        await manager.events.remove(BannerIds.GovernanceParticipation)
        queryClient.invalidateQueries({
          queryKey: ['receivedNotificationEvents'],
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
