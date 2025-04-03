import {useReceivedNotificationEvents} from '@yoroi/notifications'
import {Notifications} from '@yoroi/types'
import * as React from 'react'

import {useTransactionInfos} from '../../../yoroi-wallets/hooks'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'

export const useWalletNotifications = () => {
  const {wallet} = useSelectedWallet()
  const {data: receivedNotifications = [], refetch} = useReceivedNotificationEvents()
  const transactionInfos = useTransactionInfos({wallet})
  const walletId = wallet.id

  const data = React.useMemo(() => {
    return receivedNotifications.filter((e) => e.trigger === Notifications.Trigger.Push)
  }, [receivedNotifications, walletId, transactionInfos])
  return {data, refetch}
}
