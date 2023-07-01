import {UseMutationOptions, useQuery} from 'react-query'

import {useMutationWithInvalidations} from '../../yoroi-wallets/hooks'
import {useStorage} from '../../yoroi-wallets/storage'
import {parseSafe} from '../../yoroi-wallets/utils'

export const usePrivacyMode = () => {
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

export const useSetPrivacyMode = ({...options}: UseMutationOptions<void, Error, PrivacyMode> = {}) => {
  const storage = useStorage()
  const mutation = useMutationWithInvalidations({
    mutationFn: async (privacyMode) => storage.join('appSettings/').setItem('privacyMode', privacyMode),
    invalidateQueries: [['privacyMode']],
    ...options,
  })

  return mutation.mutate
}

type PrivacyMode = 'SHOWN' | 'HIDDEN'
const defaultPrivacyMode: PrivacyMode = 'SHOWN'

const parsePrivacyMode = (data: unknown) => {
  const isPrivacyMode = (data: unknown): data is PrivacyMode => data === 'SHOWN' || data === 'HIDDEN'
  const parsed = parseSafe(data)

  return isPrivacyMode(parsed) ? parsed : undefined
}
