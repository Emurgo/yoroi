export const useAuthWithOs = (
  options?: UseMutationOptions<void, Error>,
  {authenticationPrompt}: {authenticationPrompt?: AuthenticationPrompt} = {},
) => {
  const strings = useStrings()

  const alert = (error: unknown) => {
    if (error instanceof Keychain.Errors.CancelledByUser) return
    if (error instanceof Keychain.Errors.TooManyAttempts)
      return Alert.alert(strings.error, strings.tooManyAttempts)
    return Alert.alert(strings.error, strings.unknownError)
  }

  const defaultAuthenticationPrompt: AuthenticationPrompt = {
    cancel: strings.cancel,
    title: strings.authorize,
  }

  const mutation = useMutation({
    ...options,
    mutationFn: () =>
      Keychain.authenticate(
        authenticationPrompt ?? defaultAuthenticationPrompt,
      ),
    onError: (error, variables, context) => {
      logger.error('useAuthWithOs: Loging with OS has failed', {error})
      alert(error)
      options?.onError?.(error, variables, context)
    },
  })

  return {
    ...mutation,
    authWithOs: mutation.mutate,
  }
}