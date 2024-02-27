import {parseSafe, useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import _ from 'lodash'
import {UseMutationOptions, useQuery} from 'react-query'

import {useSelectedWallet} from '../../../SelectedWallet'
import {AddressMode} from '../../../yoroi-wallets/types/yoroi'
import {keyAddressMode} from './storage'

const useAddressMode = () => {
  const storage = useAsyncStorage()
  const wallet = useSelectedWallet()
  const walletStorage = storage.join(`wallet/${wallet.id}/`)

  const query = useQuery<AddressMode, Error>({
    queryKey: [wallet.id, keyAddressMode],
    queryFn: async () => {
      const addressMode = await walletStorage.getItem(keyAddressMode, parseAddressMode)
      console.log('----storage', addressMode, initialAddressMode)
      return addressMode ?? initialAddressMode
    },
    suspense: true,
  })

  if (query.data == null) throw new Error('Invalid state')

  return query.data
}

const useSetAddressMode = (options?: UseMutationOptions<void, Error, AddressMode>) => {
  const storage = useAsyncStorage()
  const wallet = useSelectedWallet()
  const walletStorage = storage.join(`wallet/${wallet.id}/`)

  const mutation = useMutationWithInvalidations({
    mutationFn: (addressMode: AddressMode) => walletStorage.setItem(keyAddressMode, addressMode),
    invalidateQueries: [[wallet.id, keyAddressMode]],
    ...options,
  })

  return mutation.mutate
}

const useToogleAddressMode = ({...options}: UseMutationOptions<void, Error, void> = {}) => {
  const storage = useAsyncStorage()
  const wallet = useSelectedWallet()
  const walletStorage = storage.join(`wallet/${wallet.id}/`)

  const addressMode = useAddressMode()

  const mutation = useMutationWithInvalidations({
    mutationFn: () => walletStorage.setItem(keyAddressMode, addressMode === 'single' ? 'multiple' : 'single'),
    invalidateQueries: [[wallet.id, keyAddressMode]],
    ...options,
  })

  return {
    toggle: mutation.mutate,
    isToggleLoading: mutation.isLoading,
  }
}

const initialAddressMode: AddressMode = 'multiple'

const parseAddressMode = (data: unknown) => {
  const isAddressMode = (data: unknown): data is AddressMode => data === 'single' || data === 'multiple'
  const parsed = parseSafe(data)

  return isAddressMode(parsed) ? parsed : undefined
}

export const useAddressModeManager = () => {
  const addressMode = useAddressMode()
  const {toggle, isToggleLoading} = useToogleAddressMode()
  const setAddressMode = useSetAddressMode()

  const isSingle = addressMode === 'single'
  const isMultiple = addressMode === 'multiple'

  return {
    isMultiple,
    isSingle,
    isToggleLoading,
    addressMode,
    toggle,
    enableSingleMode: () => setAddressMode('single'),
    enableMultipleMode: () => setAddressMode('multiple'),
  }
}
