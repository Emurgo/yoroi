import {Platform} from 'react-native'
import * as Keychain from 'react-native-keychain'

export function saveSecret({key, value}: {key: string; value: string}) {
  return Keychain.setGenericPassword(key, value, {
    service: key,
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
  }).then((result) => {
    if (result === false) throw new Error('Unable to store secret')
    return result as Keychain.Result
  })
}

export async function loadSecret({
  key,
  authenticationPrompt,
}: {
  key: string
  authenticationPrompt: Keychain.Options['authenticationPrompt']
}) {
  const credentials: false | Keychain.UserCredentials = await Keychain.getGenericPassword({
    service: key,
    authenticationPrompt,
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
  })

  if (!credentials) throw new Error('Failed to load secret')
  return credentials.password
}

export async function resetSecret({key}: {key: string}) {
  return Keychain.resetGenericPassword({
    service: key,
  })
}

export async function canEnableAuthOs() {
  return Platform.select({
    android: () => Keychain.getSupportedBiometryType().then((supportedBioType) => supportedBioType != null),
    ios: () =>
      Promise.all([
        Keychain.canImplyAuthentication({
          authenticationType: Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
        }),
        Keychain.getSupportedBiometryType(),
      ]).then(([canAuth, supportedBioType]) => supportedBioType != null && canAuth),
    default: () => Promise.reject('OS Authentication is not supported'),
  })()
}

export type AuthenticationPrompt = Keychain.Options['authenticationPrompt']
