import {parseSafe, useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {UseMutationOptions, useQuery} from 'react-query'

import {useSelectedWallet} from '../../../SelectedWallet'

const queryKey = 'showMultipleAddressesModal'

export const useWriteMultipleAddressesModal = ({...options}: UseMutationOptions<void, Error> = {}) => {
  const storage = useAsyncStorage()
  const wallet = useSelectedWallet()
  const mutation = useMutationWithInvalidations({
    mutationFn: () => storage.join(`appSettings/${wallet.id}/`).setItem(queryKey, true),
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
      const storedStorage = await storage.join(`appSettings/${wallet.id}/`).getItem(queryKey)

      return parseSafe(storedStorage)
    },
    suspense: true,
  })

  return query.data
}

export const useMultipleAddresses = () => {
  const readModalInfo = useReadMultipleAddressesModal()
  const writeModalInfo = useWriteMultipleAddressesModal()

  return {
    hideMultipleAddressesModal: () => writeModalInfo(),
    modalInfo: readModalInfo,
  }
}
