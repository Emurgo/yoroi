import {UseMutationOptions, useMutation} from '@tanstack/react-query'
import {Alert} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {Keychain} from '~/kernel/storage/Keychain'
import {AuthenticationPrompt} from '~/kernel/storage/KeychainStorage'

export const useAuthOsWithEasyConfirmation = (
  {
    walletId: _walletId,
    authenticationPrompt,
  }: {walletId: string; authenticationPrompt?: AuthenticationPrompt},
  options?: UseMutationOptions<string, Error>,
) => {
  const strings = useStrings()

  const alert = (error: unknown) => {
    if (error instanceof Keychain.Errors.CancelledByUser) return
    if (error instanceof Keychain.Errors.TooManyAttempts)
      return Alert.alert(strings.global.error, strings.global.tooManyAttempts)
    return Alert.alert(strings.global.error, strings.global.unknownError)
  }

  const defaultAuthenticationPrompt: AuthenticationPrompt = {
    cancel: strings.global.cancel,
    title: strings.global.accept,
  }

  const mutation = useMutation({
    ...options,
    mutationFn: () =>
      Keychain.getWalletKey(
        id,
        authenticationPrompt ?? defaultAuthenticationPrompt,
      ),
    onError: (error, variables, context) => {
      logger.error('useAuthWithOs: Signing Tx with OS has failed', {error})
      alert(error)
      options?.onError?.(error, variables, context)
    },
  })

  return {
    ...mutation,
    authWithOs: mutation.mutate,
  }
}
