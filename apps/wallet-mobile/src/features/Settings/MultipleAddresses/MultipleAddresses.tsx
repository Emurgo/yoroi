import {parseSafe, useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {UseMutationOptions, useQuery} from 'react-query'

import {useSelectedWallet} from '../../../SelectedWallet'

export const useReadMultipleAddresses = () => {
  const storage = useAsyncStorage()
  const wallet = useSelectedWallet()

  const query = useQuery<ReceiveType, Error>({
    queryKey: ['addressDerivationType'],
    queryFn: async () => {
      const storedStorageReceiveType = await storage
        .join(`wallet/${wallet.id}/`)
        .getItem('addressDerivationType', parseReceiveType)

      return storedStorageReceiveType ?? defaultReceiveType
    },
    suspense: true,
  })

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!query.data) throw new Error('Invalid state')

  return query.data
}

export const useWriteReceiveType = ({...options}: UseMutationOptions<void, Error, ReceiveType> = {}) => {
  const storage = useAsyncStorage()
  const wallet = useSelectedWallet()

  const mutation = useMutationWithInvalidations({
    mutationFn: (receiveType) => storage.join(`wallet/${wallet.id}/`).setItem('addressDerivationType', receiveType),
    invalidateQueries: [['addressDerivationType']],
    ...options,
  })

  return mutation.mutate
}

export const useToogleReceiveType = ({...options}: UseMutationOptions<void, Error, void> = {}) => {
  const storage = useAsyncStorage()
  const receiveType = useReadMultipleAddresses()
  const wallet = useSelectedWallet()

  const mutation = useMutationWithInvalidations({
    mutationFn: () =>
      storage
        .join(`wallet/${wallet.id}/`)
        .setItem('addressDerivationType', receiveType === 'SINGLE' ? 'MULTIPLE' : 'SINGLE'),
    invalidateQueries: [['addressDerivationType']],
    ...options,
  })

  return {
    toggleReceiveType: mutation.mutate,
    isToggleReceiveTypeLoading: mutation.isLoading,
  }
}

export type ReceiveType = 'SINGLE' | 'MULTIPLE'
const defaultReceiveType: ReceiveType = 'SINGLE'

const parseReceiveType = (data: unknown) => {
  const isMultipleAddresses = (data: unknown): data is ReceiveType => data === 'SINGLE' || data === 'MULTIPLE'
  const parsed = parseSafe(data)

  return isMultipleAddresses(parsed) ? parsed : undefined
}

export const useMultipleAddresses = () => {
  const receiveType = useReadMultipleAddresses()
  const {toggleReceiveType, isToggleReceiveTypeLoading} = useToogleReceiveType()
  const writePrivacyMode = useWriteReceiveType()

  return {
    isMultipleAddress: receiveType === 'MULTIPLE',
    isSingleAddress: receiveType === 'SINGLE',
    receiveType,
    toggleReceiveType,
    isToggleReceiveTypeLoading,
    setMultipleAddressesOff: () => writePrivacyMode('SINGLE'),
    setMultipleAddressesOn: () => writePrivacyMode('MULTIPLE'),
  }
}
