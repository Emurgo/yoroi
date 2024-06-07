import {useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {UseMutationOptions, useQuery} from 'react-query'

import {useSelectedWallet} from './hooks/useSelectedWallet'
import {AddressMode} from './types'
import {parseWalletMeta} from './validators'

// TODO: revisit
const useAddressMode = () => {
  const storage = useAsyncStorage()
  const wallet = useSelectedWallet()
  const rootWalletStorage = storage.join('wallet/')

  const query = useQuery<AddressMode, Error>({
    queryKey: [wallet.id, 'addressMode'],
    queryFn: async () => {
      const walletMeta = await rootWalletStorage.getItem(wallet.id, parseWalletMeta)
      if (!walletMeta) throw new Error('Invalid wallet id')

      return walletMeta.addressMode ?? initialAddressMode
    },
    suspense: true,
  })

  if (query.data == null) throw new Error('Invalid state')

  return query.data
}

const useSaveAddressMode = (options?: UseMutationOptions<void, Error, AddressMode>) => {
  const storage = useAsyncStorage()
  const wallet = useSelectedWallet()
  const rootWalletStorage = storage.join('wallet/')

  const mutation = useMutationWithInvalidations<void, Error, AddressMode>({
    mutationFn: async (addressMode) => {
      const walletMeta = await rootWalletStorage.getItem(wallet.id, parseWalletMeta)
      if (!walletMeta) throw new Error('Invalid wallet id')

      return rootWalletStorage.setItem(wallet.id, {...walletMeta, addressMode})
    },
    invalidateQueries: [[wallet.id, 'addressMode'], ['walletMetas']],
    ...options,
  })

  return mutation.mutate
}

const useToogleAddressMode = (options?: UseMutationOptions<void, Error, void>) => {
  const storage = useAsyncStorage()
  const wallet = useSelectedWallet()
  const rootWalletStorage = storage.join(`wallet/`)

  const addressMode = useAddressMode()

  const mutation = useMutationWithInvalidations({
    mutationFn: async () => {
      const walletMeta = await rootWalletStorage.getItem(wallet.id, parseWalletMeta)
      if (!walletMeta) throw new Error('Invalid wallet id')

      return rootWalletStorage.setItem(wallet.id, {
        ...walletMeta,
        addressMode: addressMode === 'single' ? 'multiple' : 'single',
      })
    },
    invalidateQueries: [[wallet.id, 'addressMode'], ['walletMetas']],
    ...options,
  })

  return {
    toggle: mutation.mutate,
    isToggleLoading: mutation.isLoading,
  }
}

const initialAddressMode: AddressMode = 'single'

export const useAddressModeManager = () => {
  const addressMode = useAddressMode()
  const {toggle, isToggleLoading} = useToogleAddressMode()

  const saveAddressMode = useSaveAddressMode()
  const enableMultipleMode = () => saveAddressMode('multiple')
  const enableSingleMode = () => saveAddressMode('single')

  const isSingle = addressMode === 'single'
  const isMultiple = addressMode === 'multiple'

  return {
    isMultiple,
    isSingle,
    isToggleLoading,
    addressMode,
    toggle,
    enableSingleMode,
    enableMultipleMode,
  }
}
