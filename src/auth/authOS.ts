import {Platform} from 'react-native'
import Keychain from 'react-native-keychain'
import {useMutation, UseMutationOptions, useQuery, UseQueryOptions} from 'react-query'

import {useMutationWithInvalidations} from '../hooks'
import {isEmptyString} from '../legacy/utils'
import {Storage} from '../Storage'

export const useCanEnableAuthOs = (options?: UseQueryOptions<boolean, Error>) => {
  const query = useQuery({
    queryKey: ['canEnableOSAuth'],
    queryFn: isAuthOsEnabled,
    ...options,
  })

  return {
    ...query,
    canEnableOsAuth: query.data,
  }
}

export const useSaveSecret = (options?: UseMutationOptions<Keychain.Result, Error, {key: string; value: string}>) => {
  const mutation = useMutation({
    mutationFn: ({key, value}: {key: string; value: string}) =>
      Keychain.setGenericPassword(key, value, {
        service: key,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
      }).then((result) => {
        if (result === false) throw new Error('Unable to store secret')
        return result as Keychain.Result
      }),
    ...options,
  })

  return {
    saveSecret: mutation.mutate,
    ...mutation,
  }
}

export const useLoadSecret = (
  options: UseMutationOptions<
    string,
    Error,
    {key: string; authenticationPrompt: Keychain.Options['authenticationPrompt']}
  > = {},
) => {
  const mutation = useMutation({
    mutationFn: async ({
      key,
      authenticationPrompt,
    }: {
      key: string
      authenticationPrompt: Keychain.Options['authenticationPrompt']
    }) => {
      const credentials: false | Keychain.UserCredentials = await Keychain.getGenericPassword({
        service: key,
        authenticationPrompt,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
      })

      if (!credentials) throw new Error('Failed to load secret')
      return credentials.password
    },
    ...options,
  })

  return {
    loadSecret: mutation.mutate,
    ...mutation,
  }
}

export const useResetSecret = (options?: UseMutationOptions<boolean, Error, {key: string}>) => {
  const mutation = useMutation({
    mutationFn: async ({key}: {key: string}) =>
      Keychain.resetGenericPassword({
        service: key,
      }),
    ...options,
  })

  return {
    resetSecret: mutation.mutate,
    ...mutation,
  }
}

export const useAuthMethod = (storage: Storage, options?: UseQueryOptions<AuthMethodState, Error>) => {
  const query = useQuery({
    queryKey: ['authMethod'],
    queryFn: () =>
      Promise.resolve(authMethodKey)
        .then(storage.getItem)
        .then((storedAuthMethod) => (!isEmptyString(storedAuthMethod) ? storedAuthMethod : '""'))
        .then(JSON.parse)
        .then((parsedAuthMethod) => {
          switch (parsedAuthMethod) {
            case 'pin':
              return {
                isPIN: true,
                isOS: false,
                isNone: false,
              } as const
            case 'os':
              return {
                isPIN: false,
                isOS: true,
                isNone: false,
              } as const
            default:
              return {
                isPIN: false,
                isOS: false,
                isNone: true,
              } as const
          }
        }),
    ...options,
  })

  return {
    authMethod: query.data,
    ...query,
  }
}

export const useSaveAuthMethod = (storage: Storage, options?: UseMutationOptions<void, Error, AuthMethod>) => {
  const mutation = useMutationWithInvalidations({
    mutationFn: (authMethod) => storage.setItem(authMethodKey, JSON.stringify(authMethod)),
    invalidateQueries: [['authMethod']],
    ...options,
  })

  return {
    ...mutation,
    saveAuthMethod: mutation.mutate,
  }
}

export const useAuthOsAppKey = (storage: Storage, options?: UseQueryOptions<string, Error>) => {
  const query = useQuery({
    suspense: true,
    queryKey: ['installationId'],
    queryFn: () =>
      storage
        .getItem('/appSettings/installationId')
        .then((data) => {
          if (data != null) return data
          throw new Error('Invalid state')
        })
        .then(JSON.parse),
    ...options,
  })

  return query.data
}

// HELPERS
export async function isAuthOsEnabled() {
  return Platform.select({
    android: () =>
      Keychain.getSupportedBiometryType().then(
        (supportedBioType) => supportedBioType != null && androidSupportedBioTypes.includes(supportedBioType),
      ),
    ios: () =>
      Promise.all([
        Keychain.canImplyAuthentication({
          authenticationType: Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
        }),
        Keychain.getSupportedBiometryType(),
      ]).then(
        ([canAuth, supportedBioType]) =>
          supportedBioType != null && iosSupportedBioTypes.includes(supportedBioType) && canAuth,
      ),
    default: () => Promise.reject('OS Authentication is not supported'),
  })()
}

const authMethodKey = '/appSettings/authMethod'
const iosSupportedBioTypes = [Keychain.BIOMETRY_TYPE.TOUCH_ID, Keychain.BIOMETRY_TYPE.FACE_ID]
const androidSupportedBioTypes = [
  Keychain.BIOMETRY_TYPE.FINGERPRINT,
  Keychain.BIOMETRY_TYPE.FACE,
  Keychain.BIOMETRY_TYPE.IRIS,
]

type AuthMethod = 'pin' | 'os'

type AuthMethodState =
  | {
      isPIN: true
      isOS: false
      isNone: false
    }
  | {
      isPIN: false
      isOS: true
      isNone: false
    }
  | {
      isPIN: false
      isOS: false
      isNone: true
    }
