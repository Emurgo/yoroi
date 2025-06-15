import {parseString} from '@yoroi/common'

import {UseMutationOptions} from '@tanstack/react-query'
import {decryptData} from '../../../kernel/crypto/decrypt-data'
import {logger} from '../../../kernel/logger/logger'

export const useCheckPin = (
  options: UseMutationOptions<boolean, Error, string> = {},
) => {
  const mutation = useMutation({
    mutationFn: async (pin) => {
      const encryptedPinHash = await storage
        .join('appSettings/')
        .getItem('customPinHash', parseString)
      if (!encryptedPinHash) throw new Error('missing pin')

      return decryptData(encryptedPinHash, pin)
        .then(() => true)
        .catch((error) => {
          logger.error('useCheckPin: Checking pin has failed', {error})
          if (error instanceof App.Errors.WrongPassword) return false
          throw error
        })
    },
    retry: false,
    ...options,
  })

  return {
    checkPin: mutation.mutate,
    isValid: mutation.data,
    ...mutation,
  }
}
