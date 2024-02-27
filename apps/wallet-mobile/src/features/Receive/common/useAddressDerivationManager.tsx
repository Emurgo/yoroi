import {parseSafe, useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import _ from 'lodash'
import {UseMutationOptions, useQuery} from 'react-query'

import {useSelectedWallet} from '../../../SelectedWallet'

const keyAddressDerivationType = 'addressDerivationType'

const useAddressDerivationMode = () => {
  const storage = useAsyncStorage()
  const wallet = useSelectedWallet()
  const walletStorage = storage.join(`wallet/${wallet.id}/`)

  const query = useQuery<AddressDerivation, Error>({
    queryKey: [wallet.id, keyAddressDerivationType],
    queryFn: async () => {
      const addressDerivationType = await walletStorage.getItem(keyAddressDerivationType, parseAddressDerivation)

      return addressDerivationType ?? initialAddressDerivation
    },
    suspense: true,
  })

  if (query.data == null) throw new Error('Invalid state')

  return query.data
}

const useSetAddressDerivationMode = (options?: UseMutationOptions<void, Error, AddressDerivation>) => {
  const storage = useAsyncStorage()
  const wallet = useSelectedWallet()
  const walletStorage = storage.join(`wallet/${wallet.id}/`)

  const mutation = useMutationWithInvalidations({
    mutationFn: (addressDerivationMode) => walletStorage.setItem(keyAddressDerivationType, addressDerivationMode),
    invalidateQueries: [[wallet.id, keyAddressDerivationType]],
    ...options,
  })

  return mutation.mutate
}

const useToogleAddressDerivationMode = ({...options}: UseMutationOptions<void, Error, void> = {}) => {
  const storage = useAsyncStorage()
  const wallet = useSelectedWallet()
  const walletStorage = storage.join(`wallet/${wallet.id}/`)

  const addressDerivationMode = useAddressDerivationMode()

  const mutation = useMutationWithInvalidations({
    mutationFn: () =>
      walletStorage.setItem(keyAddressDerivationType, addressDerivationMode === 'single' ? 'multiple' : 'single'),
    invalidateQueries: [[wallet.id, keyAddressDerivationType]],
    ...options,
  })

  return {
    toggle: mutation.mutate,
    isToggleLoading: mutation.isLoading,
  }
}

export type AddressDerivation = 'single' | 'multiple'
const initialAddressDerivation: AddressDerivation = 'multiple'

const parseAddressDerivation = (data: unknown) => {
  const isAddressDerivation = (data: unknown): data is AddressDerivation => data === 'single' || data === 'multiple'
  const parsed = parseSafe(data)

  return isAddressDerivation(parsed) ? parsed : undefined
}

export const useAddressDerivationManager = () => {
  const addressDerivation = useAddressDerivationMode()
  const {toggle, isToggleLoading} = useToogleAddressDerivationMode()
  const setAddressDerivationMode = useSetAddressDerivationMode()

  const isSingle = addressDerivation === 'single'
  const isMultiple = addressDerivation === 'multiple'

  return {
    isMultiple,
    isSingle,
    isToggleLoading,
    addressDerivation,
    toggle,
    enableSingleMode: () => setAddressDerivationMode('single'),
    enableMultipleMode: () => setAddressDerivationMode('multiple'),
  }
}
