import {
  isString,
  useAsyncStorage,
  useMutationWithInvalidations,
} from '@yoroi/common'
import {App} from '@yoroi/types'
import {useWalletManager} from '@yoroi/wallet-manager'

export const useChangeNotificationDisplaySettings = () => {
  const storage = useAsyncStorage()
  const walletManager = useWalletManager()
  const selectedWalletId = walletManager.selected.wallet?.id
  const mutationFn = async (value: boolean) => {
    if (!isString(selectedWalletId))
      throw new Error(
        'useChangeNotificationDisplaySettings: No wallet selected',
      )
    await changeNotificationDisplaySettings(storage, selectedWalletId, value)
  }
  return useMutationWithInvalidations({
    mutationFn,
    invalidateQueries: [['settings', selectedWalletId, 'notifications']],
  })
}

const changeNotificationDisplaySettings = async (
  storage: App.Storage,
  walletId: string,
  value: boolean,
) => {
  await storage
    .join(`wallet/${walletId}/`)
    .setItem('displayNotifications', value)
}
