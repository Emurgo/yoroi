import {isString, useAsyncStorage} from '@yoroi/common'
import {App} from '@yoroi/types'
import {useWalletManager} from '@yoroi/wallet-manager/context/WalletManagerProvider'

import {useQuery} from '@tanstack/react-query'

const defaultNotificationsEnabled = true

export const useNotificationDisplaySettings = () => {
  const storage = useAsyncStorage()
  const walletManager = useWalletManager()
  const selectedWalletId = walletManager.selected.wallet?.id
  const query = useQuery({
    queryKey: ['settings', selectedWalletId, 'notifications'],
    queryFn: () => {
      if (!isString(selectedWalletId)) return defaultNotificationsEnabled
      return getNotificationDisplaySettings(storage, selectedWalletId)
    },
    enabled: isString(selectedWalletId),
  })

  return query.data ?? defaultNotificationsEnabled
}

const getNotificationDisplaySettings = async (
  storage: App.Storage,
  walletId: string,
): Promise<boolean> => {
  const setting = await storage
    .join(`wallet/${walletId}/`)
    .getItem('displayNotifications', (value) =>
      isString(value) ? JSON.parse(value) : null,
    )
  return setting ?? defaultNotificationsEnabled
}
