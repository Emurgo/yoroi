import {useQuery, useQueryClient} from '@tanstack/react-query'
import {time} from '@yoroi/common'
import {useNotificationManager} from '@yoroi/notifications'
import {Chain, Notifications} from '@yoroi/types'

import {BannerIds, showBanner} from '~/features/Notifications/common/banners'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useWalletEvent} from '~/features/WalletManager/hooks/useWalletEvent'
import {useIsParticipatingInGovernance} from '../common/helpers'
import {useStrings} from '~/kernel/i18n/useStrings'

export const useGovernanceBanner = () => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const manager = useNotificationManager()
  const {
    selected: {network},
  } = useWalletManager()

  const isParticipating = useIsParticipatingInGovernance()
  const queryKey = ['governanceBanner', wallet?.id, network]
  const queryClient = useQueryClient()

  useWalletEvent(wallet, 'utxos', () => queryClient.invalidateQueries(queryKey))

  useQuery({
    queryKey,
    staleTime: time.fiveMinutes,
    queryFn: async () => {
      if (!isParticipating) {
        if (network === Chain.Network.Mainnet) {
          const last = (await manager.events.read()).find(
            (ev) =>
              ev.trigger === Notifications.Trigger.Banner &&
              ev.id === BannerIds.GovernanceParticipation,
          )

          if (
            !last ||
            new Date(last.date).getTime() + time.oneMonth < Date.now()
          ) {
            showBanner({
              id: BannerIds.GovernanceParticipation,
              title: strings.newToGovernanceTitle,
              body: strings.newToGovernanceText,
              isRead: !!last,
            })
          }
        }
        return true
      } else {
        manager.events.remove(BannerIds.GovernanceParticipation)
        return false
      }
    },
  })
}
