import {useQuery, useQueryClient, UseQueryOptions} from '@tanstack/react-query'
import * as React from 'react'
import {AppState} from 'react-native'

export const useIsAuthOsSupported = (
  options?: UseQueryOptions<boolean, Error>,
) => {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['useIsAuthOsSupported'],
    queryFn: isAuthOsSupported,
    ...options,
  })

  React.useEffect(() => {
    const appStateSubscription = AppState.addEventListener(
      'change',
      (appState) => {
        // when using OS auth and app is active again needs to check if still enabled
        if (appState === 'active') {
          query.refetch()
        }
      },
    )
    return () => appStateSubscription?.remove()
  }, [query, queryClient])

  return Boolean(query.data)
}
