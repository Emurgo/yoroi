import {
  isBoolean,
  useAsyncStorage,
  useMutationWithInvalidations,
} from '@yoroi/common'

import {useSuspenseQuery} from '@tanstack/react-query'

import {legalQueryKeys} from '~/common/queries'

import {Disclaimer} from '../../../common/types'

export const useDisclaimerState = (name: Disclaimer, key = 'accepted') => {
  const storage = useAsyncStorage()
  const walletStorage = storage.join(`disclaimer/${name}/`)
  const queryKey = legalQueryKeys.disclaimer(name)

  const mutation = useMutationWithInvalidations({
    mutationFn: async (value: boolean) => {
      await walletStorage.setItem(key, value)
    },
    invalidateQueries: [queryKey],
  })

  const query = useSuspenseQuery({
    queryKey,
    queryFn: async () => {
      // getItem already parses the value using parseSafe internally
      const storedValue = await walletStorage.getItem(key)
      return isBoolean(storedValue) ? storedValue : false
    },
  })

  return [query.data, mutation.mutate] as const
}
