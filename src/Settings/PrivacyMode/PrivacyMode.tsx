import {UseMutationOptions, useQuery} from 'react-query'

import {useMutationWithInvalidations} from '../../hooks'
import {isEmptyString} from '../../legacy/utils'
import {storage} from '../../yoroi-wallets/storage'
import {parseString} from '../../yoroi-wallets/utils/parsing'

export const usePrivacyMode = () => {
  const query = useQuery<PrivacyMode, Error>({
    queryKey: ['privacyMode'],
    queryFn: async () => {
      const storedPrivacyMode = await storage.join('appSettings/').getItem('privacyMode', parseString)

      if (!isEmptyString(storedPrivacyMode)) {
        const parsedPrivacyMode = JSON.parse(storedPrivacyMode)
        return parsedPrivacyMode
      }

      return defaultPrivacyMode
    },
    suspense: true,
  })

  if (isEmptyString(query.data)) throw new Error('Invalid state')

  return query.data
}

export const useSetPrivacyMode = ({...options}: UseMutationOptions<void, Error, PrivacyMode> = {}) => {
  const mutation = useMutationWithInvalidations({
    mutationFn: async (privacyMode) => storage.join('appSettings/').setItem('privacyMode', privacyMode),
    invalidateQueries: [['privacyMode']],
    ...options,
  })

  return mutation.mutate
}

type PrivacyMode = 'SHOWN' | 'HIDDEN'
const defaultPrivacyMode: PrivacyMode = 'SHOWN'
