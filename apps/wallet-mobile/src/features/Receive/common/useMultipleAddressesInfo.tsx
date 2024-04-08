import {isBoolean, parseSafe, useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {UseMutationOptions, useQuery, UseQueryOptions} from 'react-query'

import {useSelectedWallet} from '../../SelectedWallet/Context'

const isShowingMultipleAddressInfoKey = 'isShowingMultipleAddressesModal'

const useSetShowMultipleAddressesInfo = (options?: UseMutationOptions<void, Error, boolean>) => {
  const storage = useAsyncStorage()
  const wallet = useSelectedWallet()
  const walletStorage = storage.join(`wallet/${wallet.id}/`)

  const mutation = useMutationWithInvalidations({
    mutationFn: (show) => walletStorage.setItem(isShowingMultipleAddressInfoKey, show),
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
    hideMultipleAddressesInfo: (options?: UseMutationOptions<void, Error, boolean>) =>
      setShowMultipleAddressInfo(false, options),
    showMultipleAddressesInfo: (options?: UseMutationOptions<void, Error, boolean>) =>
      setShowMultipleAddressInfo(true, options),
    isShowingMultipleAddressInfo,
  }
}
