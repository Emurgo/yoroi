import {parseSafe, useAsyncStorage} from '@yoroi/common'
import {useCallback} from 'react'
import {useMutation, useQuery, useQueryClient} from 'react-query'

import {useSelectedWallet} from '../../../SelectedWallet'

const queryKey = 'showMultipleAddressesModal'

export const useMultipleAddressesModalInfo = () => {
  const storage = useAsyncStorage()
  const queryClient = useQueryClient()
  const wallet = useSelectedWallet()

  type ModalInfo = {
    show: boolean
  }

  const mutationFn = useCallback(async () => {
    await storage.join(`appSettings/${wallet.id}/`).setItem<ModalInfo>(queryKey, {show: false})
  }, [storage, wallet.id])

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries([queryKey]),
  })
  return {
    ...mutation,
    hideMultipeAddressesModal: mutation.mutate,
  }
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

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!query.data) throw new Error('Invalid state')

  return query.data
}
