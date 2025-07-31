import {useQuery} from '@tanstack/react-query'
import {time} from '@yoroi/common'
import {useNotificationManager} from '@yoroi/notifications'
import {Chain, Notifications} from '@yoroi/types'

import {BannerIds, showBanner} from '~/features/Notifications/common/banners'
import {useStrings} from '~/features/Transactions/common/strings'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useAddressMode} from '~/features/WalletManager/hooks/useAddressMode'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {features} from '~/kernel/features'
import {useUtxoList} from '~/features/Transactions/useCases/UtxoList/useUtxoList'

export const useUtxoConsolidationBanner = () => {
  const {wallet} = useSelectedWallet()
  const manager = useNotificationManager()
  const {
    selected: {network},
  } = useWalletManager()
  const {utxoList, isLoading} = useUtxoList()
  const {isSingle} = useAddressMode()
  const isConsolidationNeeded = (utxoList?.length ?? 0) > 1 && isSingle
  const strings = useStrings()

  useQuery({
    queryKey: ['utxoConsolidationBanner', wallet?.id, network],
    staleTime: time.fiveMinutes,
    enabled: !isLoading && features.utxoConsolidation,
    queryFn: async () => {
      if (isConsolidationNeeded) {
        if (network === Chain.Network.Mainnet) {
          const last = (await manager.events.read()).find(
            (ev) =>
              ev.trigger === Notifications.Trigger.Banner &&
              ev.id === BannerIds.UtxoConsolidation,
          )

          if (
            !last ||
            new Date(last.date).getTime() + time.oneWeek < Date.now()
          ) {
            showBanner({
              id: BannerIds.UtxoConsolidation,
              title: strings.organizeWallet,
              body: strings.organizeWalletBanner,
              isRead: !!last,
            })
          }
        }
        return true
      } else {
        manager.events.remove(BannerIds.UtxoConsolidation)
        return false
      }
    },
  })
}
