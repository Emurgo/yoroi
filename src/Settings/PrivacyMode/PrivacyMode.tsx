import AsyncStorage from '@react-native-async-storage/async-storage'
import {UseMutationOptions, useQuery} from 'react-query'

import {useMutationWithInvalidations} from '../../hooks'

export const useReadPrivacyMode = () => {
  const query = useQuery<PrivacyMode, Error>({
    queryKey: ['privacyMode'],
    queryFn: async () => {
      const storedPrivacyMode = await AsyncStorage.getItem('/appSettings/privacyMode')

      if (storedPrivacyMode) {
        const parsedPrivacyMode = JSON.parse(storedPrivacyMode)
        return parsedPrivacyMode
      }

      return defaultPrivacyMode
    },
    suspense: true,
  })

  if (!query.data) throw new Error('Invalid state')

  return query.data
}

export const useWritePrivacyMode = ({...options}: UseMutationOptions<void, Error, PrivacyMode> = {}) => {
  const mutation = useMutationWithInvalidations({
    mutationFn: async (privacyMode) => AsyncStorage.setItem('/appSettings/privacyMode', JSON.stringify(privacyMode)),
    invalidateQueries: [['privacyMode']],
    ...options,
  })

  return mutation.mutate
}

export const useTogglePrivacyMode = () => {
  const privacyMode = useReadPrivacyMode()
  const writePrivacyMode = useWritePrivacyMode()
  return () => writePrivacyMode(privacyMode === 'SHOWN' ? 'HIDDEN' : 'SHOWN')
}

export const usePrivacyMode = () => {
  return {
    privacyMode: useReadPrivacyMode(),
    setPrivacyMode: useWritePrivacyMode(),
    togglePrivacyMode: useTogglePrivacyMode(),
  }
}

type PrivacyMode = 'SHOWN' | 'HIDDEN'
const defaultPrivacyMode: PrivacyMode = 'SHOWN'
