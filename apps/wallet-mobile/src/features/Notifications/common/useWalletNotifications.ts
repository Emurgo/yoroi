import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useReceivedNotificationEvents} from '@yoroi/notifications'
import * as React from 'react'
import {Notifications} from '@yoroi/types'
import {useTransactionInfos} from '../../../yoroi-wallets/hooks'

export const useWalletNotifications = () => {
  const {wallet} = useSelectedWallet()
  const {data: receivedNotifications = [], refetch} = useReceivedNotificationEvents()
  const transactionInfos = useTransactionInfos({wallet})
  const walletId = wallet.id

  const data = React.useMemo(() => {
    return receivedNotifications.filter(
      (e) =>
        e.trigger === Notifications.Trigger.TransactionReceived &&
        e.metadata.txId in transactionInfos &&
        e.metadata.walletId === walletId,
    )
  }, [receivedNotifications, wallet, transactionInfos])
  return {data, refetch}
}
