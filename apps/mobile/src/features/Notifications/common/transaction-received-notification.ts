import {useAsyncStorage} from '@yoroi/common'
import {App, Notifications as NotificationTypes} from '@yoroi/types'
import * as React from 'react'
import {Subject} from 'rxjs'

import {SyncWalletInfo} from '~/features/WalletManager/common/types'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {walletManager} from '~/features/WalletManager/wallet-manager'
import {YoroiWallet} from '~/wallets/cardano/types'
import {TRANSACTION_DIRECTION} from '~/wallets/types/other'
import {generateNotificationId} from './notifications'
import {buildProcessedNotificationsStorage} from './processed-notifications-storage'

const storageKey = 'transaction-received-notification-history'

type BuildNotificationsParams = {
  appStorage: App.Storage
  sinceDate: Date
  walletIds: string[]
}

const buildNotifications = async ({
  appStorage,
  sinceDate,
  walletIds,
}: BuildNotificationsParams) => {
  const notifications: NotificationTypes.TransactionReceivedEvent[] = []

  for (const walletId of walletIds) {
    const wallet = walletManager.getWalletById(walletId)
    if (!wallet) continue

    const fullStorageKey =
      `wallet/${walletId}/${wallet.networkManager.network}/${storageKey}/` as const
    const storage = buildProcessedNotificationsStorage(
      appStorage.join(fullStorageKey),
    )
    const processed = await storage.getValues()
    const allTxIds = getTxIds(wallet)

    if (processed.length === 0) {
      await storage.addValues(allTxIds)
      continue
    }

    const newTxIds = allTxIds.filter((txId) => !processed.includes(txId))

    if (newTxIds.length === 0) {
      continue
    }

    await storage.addValues(newTxIds)

    const transactions = wallet.transactions

    newTxIds.forEach((id) => {
      const txDate = transactions[id].submittedAt ?? new Date().toISOString()
      const isConfirmedAfterDeadline =
        new Date(txDate).getTime() > sinceDate.getTime()
      if (!isConfirmedAfterDeadline) return
      const metadata: NotificationTypes.TransactionReceivedEvent['metadata'] = {
        txId: id,
        isSentByUser:
          transactions[id]?.direction === TRANSACTION_DIRECTION.SENT,
        nextTxsCounter: newTxIds.length + processed.length,
        previousTxsCounter: processed.length,
        walletId,
      }
      notifications.push(
        createTransactionReceivedNotification(metadata, new Date(txDate)),
      )
    })
  }

  return notifications
}

const getTxIds = (wallet: YoroiWallet) => {
  const ids = wallet.allUtxos.map((utxo) => utxo.tx_hash)
  return [...new Set(ids)]
}

export const createTransactionReceivedNotification = (
  metadata: NotificationTypes.TransactionReceivedEvent['metadata'],
  date: Date,
): NotificationTypes.TransactionReceivedEvent => {
  return {
    id: generateNotificationId(),
    date: date.toISOString(),
    isRead: false,
    trigger: NotificationTypes.Trigger.TransactionReceived,
    metadata,
  } as const
}

export const transactionReceivedSubject =
  new Subject<NotificationTypes.TransactionReceivedEvent>()

export const useTransactionReceivedNotifications = ({
  enabled,
}: {
  enabled: boolean
}) => {
  const {walletManager} = useWalletManager()
  const asyncStorage = useAsyncStorage()
  const walletId = walletManager.selectedWalledId

  React.useEffect(() => {
    if (!enabled || !walletId) return
    const subscriptionBeginDate = new Date()
    let latestStatuses: Map<string, SyncWalletInfo> = new Map()
    const subscription = walletManager.syncWalletInfos$.subscribe(
      async (status) => {
        const selectedWalletOldStatus = latestStatuses.get(walletId)
        const selectedWalletCurrentStatus = status.get(walletId)
        latestStatuses = status

        if (
          selectedWalletOldStatus?.status !== 'done' &&
          selectedWalletCurrentStatus?.status === 'done'
        ) {
          const notifications = await buildNotifications({
            appStorage: asyncStorage,
            sinceDate: subscriptionBeginDate,
            walletIds: [walletId],
          })
          notifications.forEach((notification) =>
            transactionReceivedSubject.next(notification),
          )
        }
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [
    walletManager,
    asyncStorage,
    enabled,
    walletId,
    walletManager.selectedNetwork,
  ])
}
