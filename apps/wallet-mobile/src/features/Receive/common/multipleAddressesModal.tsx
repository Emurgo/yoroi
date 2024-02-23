import {parseSafe, useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {UseMutationOptions, useQuery} from 'react-query'

import {useSelectedWallet} from '../../../SelectedWallet'

const queryKey = 'showMultipleAddressesModal'

export const useSetMultipleAddressesModal = ({...options}: UseMutationOptions<void, Error> = {}) => {
  const storage = useAsyncStorage()
  const wallet = useSelectedWallet()
  const mutation = useMutationWithInvalidations({
    mutationFn: () => storage.join(`wallet/${wallet.id}/`).setItem(queryKey, true),
    invalidateQueries: [[queryKey]],
    ...options,
  })

  return mutation.mutate
}

export const useReadMultipleAddressesModal = () => {
  const storage = useAsyncStorage()
  const wallet = useSelectedWallet()

  const query = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const storedStorage = await storage.join(`wallet/${wallet.id}/`).getItem(queryKey)

      return parseSafe(storedStorage)
    },
    suspense: true,
  })

  return query.data
}

export const useMultipleAddressesModal = () => {
  const readModalInfo = useReadMultipleAddressesModal()
  const writeModalInfo = useSetMultipleAddressesModal()

  return {
    hideMultipleAddressesModal: () => writeModalInfo(),
    modalInfo: readModalInfo,
  }
}
