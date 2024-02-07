import {parseSafe, useMutationWithInvalidations, useStorage} from '@yoroi/common'
import {UseMutationOptions, useQuery} from 'react-query'

export const useReadPrivacyMode = () => {
  const storage = useStorage()
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
  const storage = useStorage()
  const mutation = useMutationWithInvalidations({
    mutationFn: async (privacyMode) => storage.join('appSettings/').setItem('privacyMode', privacyMode),
    invalidateQueries: [['privacyMode']],
    ...options,
  })

  return mutation.mutate
}

export const useTooglePrivacyMode = ({...options}: UseMutationOptions<void, Error, void> = {}) => {
  const storage = useStorage()
  const privacyMode = useReadPrivacyMode()

  const mutation = useMutationWithInvalidations({
    mutationFn: async () =>
      storage.join('appSettings/').setItem('privacyMode', privacyMode === 'SHOWN' ? 'HIDDEN' : 'SHOWN'),
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
    isPrivacyOff: privacyMode === 'HIDDEN',
    isPrivacyOn: privacyMode === 'SHOWN',
    privacyMode,
    togglePrivacyMode,
    isTogglePrivacyModeLoading,
    setPrivacyModeOff: () => writePrivacyMode('HIDDEN'),
    setPrivacyModeOn: () => writePrivacyMode('SHOWN'),
  }
}
