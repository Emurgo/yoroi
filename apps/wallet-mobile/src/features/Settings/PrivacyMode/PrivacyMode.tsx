import {parseSafe, useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {UseMutationOptions, useQuery} from '@tanstack/react-query'

export const useReadPrivacyMode = () => {
  const storage = useAsyncStorage()
  const query = useQuery<PrivacyMode, Error>({
    queryKey: ['privacyMode'],
    queryFn: async () => {
      const storedPrivacyMode = await storage.join('appSettings/').getItem('privacyMode', parsePrivacyMode)

      return storedPrivacyMode ?? defaultPrivacyMode
    },
    suspense: true,
  })

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!query.data) throw new Error('Invalid state')

  return query.data
}

export const useWritePrivacyMode = ({...options}: UseMutationOptions<void, Error, PrivacyMode> = {}) => {
  const storage = useAsyncStorage()
  const mutation = useMutationWithInvalidations({
    mutationFn: (privacyMode) => storage.join('appSettings/').setItem('privacyMode', privacyMode),
    invalidateQueries: [['privacyMode']],
    ...options,
  })

  return mutation.mutate
}

export const useTooglePrivacyMode = ({...options}: UseMutationOptions<void, Error, void> = {}) => {
  const storage = useAsyncStorage()
  const privacyMode = useReadPrivacyMode()

  const mutation = useMutationWithInvalidations({
    mutationFn: () => storage.join('appSettings/').setItem('privacyMode', privacyMode === 'SHOWN' ? 'HIDDEN' : 'SHOWN'),
    invalidateQueries: [['privacyMode']],
    ...options,
  })

  return {
    togglePrivacyMode: mutation.mutate,
    isTogglePrivacyModeLoading: mutation.isLoading,
  }
}

export type PrivacyMode = 'SHOWN' | 'HIDDEN'
const defaultPrivacyMode: PrivacyMode = 'SHOWN'

const parsePrivacyMode = (data: unknown) => {
  const isPrivacyMode = (data: unknown): data is PrivacyMode => data === 'SHOWN' || data === 'HIDDEN'
  const parsed = parseSafe(data)

  return isPrivacyMode(parsed) ? parsed : undefined
}

export const usePrivacyMode = () => {
  const privacyMode = useReadPrivacyMode()
  const {togglePrivacyMode, isTogglePrivacyModeLoading} = useTooglePrivacyMode()
  const writePrivacyMode = useWritePrivacyMode()

  return {
    isPrivacyActive: privacyMode === 'HIDDEN',
    privacyMode,
    togglePrivacyMode,
    isTogglePrivacyModeLoading,
    setPrivacyModeOff: () => writePrivacyMode('HIDDEN'),
    setPrivacyModeOn: () => writePrivacyMode('SHOWN'),
    privacyPlaceholder: '*.******',
  }
}
