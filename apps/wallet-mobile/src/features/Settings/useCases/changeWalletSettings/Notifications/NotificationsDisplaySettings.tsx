import {isString, useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {App} from '@yoroi/types'
import {useQuery} from 'react-query'

import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'

const defaultNotificationsEnabled = true

export const useNotificationDisplaySettings = () => {
  const storage = useAsyncStorage()
  const selectedWallet = useSelectedWallet()
  const selectedWalletId = selectedWallet.wallet.id
  const query = useQuery({
    queryKey: ['settings', selectedWalletId, 'notifications'],
    queryFn: () => getNotificationDisplaySettings(storage, selectedWalletId),
  })

  return query.data ?? defaultNotificationsEnabled
}

export const useChangeNotificationDisplaySettings = () => {
  const storage = useAsyncStorage()
  const selectedWallet = useSelectedWallet()
  const selectedWalletId = selectedWallet.wallet.id
  const mutationFn = (value: boolean) => changeNotificationDisplaySettings(storage, selectedWalletId, value)
  return useMutationWithInvalidations({
    mutationFn,
    invalidateQueries: [['settings', selectedWalletId, 'notifications']],
  })
}

const getNotificationDisplaySettings = async (storage: App.Storage, walletId: string): Promise<boolean> => {
  const setting = await storage
    .join(`wallet/${walletId}/`)
    .getItem('displayNotifications', (value) => (isString(value) ? JSON.parse(value) : null))
  return setting ?? defaultNotificationsEnabled
}

const changeNotificationDisplaySettings = async (storage: App.Storage, walletId: string, value: boolean) => {
  await storage.join(`wallet/${walletId}/`).setItem('displayNotifications', value)
}
