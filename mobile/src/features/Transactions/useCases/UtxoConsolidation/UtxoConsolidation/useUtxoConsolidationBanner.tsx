import {time} from '@yoroi/common'
import {useNotificationManager} from '@yoroi/notifications'
import {Chain, Notifications} from '@yoroi/types'
import {useAddressMode} from '@yoroi/wallet-manager'
import {useSelectedWallet} from '@yoroi/wallet-manager'
import {useWalletManager} from '@yoroi/wallet-manager'

import {useQuery, useQueryClient} from '@tanstack/react-query'

import {BannerIds, showBanner} from '~/features/Notifications/common/banners'
import {useUtxoList} from '~/features/Transactions/useCases/UtxoList/useUtxoList'
import {features} from '~/kernel/features'
import {useStrings} from '~/kernel/i18n/useStrings'

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
  const queryClient = useQueryClient()

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
              title: strings.transactions.utxo.utxoConsolidationTitle,
              body: strings.transactions.utxo.utxoConsolidationWarning,
              isRead: !!last,
            })
          }
        }
        return true
      } else {
        await manager.events.remove(BannerIds.UtxoConsolidation)
        queryClient.invalidateQueries({
          queryKey: ['receivedNotificationEvents'],
        })
        return false
      }
    },
  })
}
