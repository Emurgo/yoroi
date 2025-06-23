import {time} from '@yoroi/common'
import {useNotificationManager} from '@yoroi/notifications'
import {Chain, Notifications} from '@yoroi/types'
import {useQuery} from 'react-query'

import {BannerIds, showBanner} from '../../../Notifications/common/banners'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {useIsParticipatingInGovernance} from '../common/helpers'
import {useStrings} from '../common/strings'

export const useGovernanceBanner = () => {
  const {wallet} = useSelectedWallet()
  const manager = useNotificationManager()
  const {
    selected: {network},
  } = useWalletManager()

  const isParticipating = useIsParticipatingInGovernance()

  const strings = useStrings()

  useQuery({
    queryKey: ['governanceBanner', wallet?.id, network],
    staleTime: time.oneHour,
    queryFn: async () => {
      if (!isParticipating) {
        if (network === Chain.Network.Mainnet) {
          const last = (await manager.events.read()).find(
            (ev) => ev.trigger === Notifications.Trigger.Banner && ev.id === BannerIds.GovernanceParticipation,
          )

          if (!last || new Date(last.date).getTime() + time.oneMonth < Date.now()) {
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
