import {useQuery} from '@tanstack/react-query'
import {
  isBoolean,
  parseSafe,
  useAsyncStorage,
  useMutationWithInvalidations,
} from '@yoroi/common'

import {Disclaimer} from './types'

export const useDisclaimerState = (name: Disclaimer, key = 'accepted') => {
  const storage = useAsyncStorage()
  const walletStorage = storage.join(`disclaimer/${name}/`)
  const queryKey = ['disclaimer', name]

  const mutation = useMutationWithInvalidations({
    mutationFn: (value: boolean) => walletStorage.setItem(key, value),
    invalidateQueries: [queryKey],
  })

  const query = useQuery({
    suspense: true,
    queryKey,
    queryFn: async () => {
      const storedStorage = await walletStorage.getItem(key)
      const parsed = parseSafe(storedStorage)
      return isBoolean(parsed) ? parsed : false
    },
  })

  return [query.data, mutation.mutate] as const
}
