import {isBoolean, parseSafe, useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {App} from '@yoroi/types'
import {UseMutationOptions, useQuery, UseQueryOptions} from 'react-query'

import {useSelectedWallet} from '../../../SelectedWallet'

const isShowingMultipleAddressInfoKey = 'isShowingMultipleAddressesModal'

export const setShowingMultipleAddressInfo = async (storage: App.Storage<true>, show: boolean) => {
  await storage.setItem(isShowingMultipleAddressInfoKey, show)
}

const useSetShowMultipleAddressesInfo = (options?: UseMutationOptions<void, Error, boolean>) => {
  const storage = useAsyncStorage()
  const wallet = useSelectedWallet()
  const walletStorage = storage.join(`wallet/${wallet.id}/`)

  const mutation = useMutationWithInvalidations({
    mutationFn: (show) => setShowingMultipleAddressInfo(walletStorage, show),
    invalidateQueries: [[wallet.id, isShowingMultipleAddressInfoKey]],
    ...options,
  })

  return mutation.mutate
}

const useIsShowingMultipleAddressesInfo = (options?: UseQueryOptions<boolean, Error, boolean>) => {
  const storage = useAsyncStorage()
  const wallet = useSelectedWallet()
  const walletStorage = storage.join(`wallet/${wallet.id}/`)

  const query = useQuery({
    suspense: true,
    queryKey: [wallet.id, isShowingMultipleAddressInfoKey],
    ...options,
    queryFn: async () => {
      const storedStorage = await walletStorage.getItem(isShowingMultipleAddressInfoKey)

      const parsed = parseSafe(storedStorage)
      // old wallets wont have this key, so we default to true
      return isBoolean(parsed) ? parsed : true
    },
  })

  return query.data
}

export const useMultipleAddressesInfo = () => {
  const isShowingMultipleAddressInfo = useIsShowingMultipleAddressesInfo()
  const setShowMultipleAddressInfo = useSetShowMultipleAddressesInfo()

  return {
    hideMultipleAddressesInfo: () => setShowMultipleAddressInfo(false),
    showMultipleAddressesInfo: () => setShowMultipleAddressInfo(true),
    isShowingMultipleAddressInfo,
  }
}
