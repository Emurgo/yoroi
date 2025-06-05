export const useIsAuthOsSupported = (
  options?: UseQueryOptions<boolean, Error>,
) => {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['isAuthOsSupported'],
    queryFn: isAuthOsSupported,
    suspense: true,
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

  if (query.data == null) return false

  return query.data
}

const isAuthOsSupported = () => {
  return Platform.select({
    android: async () =>
      canAuthWithOS({
        platform: 'android',
        supportedBiometryType: await RNKeychain.getSupportedBiometryType(),
      }),
    ios: async () =>
      canAuthWithOS({
        platform: 'ios',
        supportedBiometryType: await RNKeychain.getSupportedBiometryType(),
        canImplyAuthentication: await RNKeychain.canImplyAuthentication({
          authenticationType:
            RNKeychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
        }),
      }),
    default: () =>
      Promise.reject(new Error('OS Authentication is not supported')),
  })()
}
