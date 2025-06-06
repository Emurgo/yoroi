import {useQuery, useQueryClient, UseQueryOptions} from '@tanstack/react-query'
import * as LocalAuthentication from 'expo-local-authentication'
import * as React from 'react'
import {AppState, Platform} from 'react-native'

import {canAuthWithOS} from '../common/helpers'

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

const isAuthOsSupported = async () => {
  return Platform.select({
    android: async () =>
      canAuthWithOS({
        platform: 'android',
      }),
    ios: async () =>
      canAuthWithOS({
        platform: 'ios',
        canImplyAuthentication: await LocalAuthentication.hasHardwareAsync(),
      }),
    default: () => Promise.resolve(false),
  })()
}
