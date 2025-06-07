import * as LocalAuth from 'expo-local-authentication'
import {Platform} from 'react-native'

import {logger} from '../../../kernel/logger/logger'

export const getHostAuthMethods = async () => {
  try {
    const methods = await LocalAuth.supportedAuthenticationTypesAsync()
    logger.info('Host auth methods', {
      origin: 'getHostAuthMethods',
      type: 'info',
      methods,
    })
    return methods
  } catch (error) {
    logger.error(error as Error, {origin: 'getHostAuthMethods', type: 'error'})
    return Promise.resolve([])
  }
}

export const isAuthOsSupported = () =>
  Platform.select({
    native: async () => {
      const hasBiometricHardware = await LocalAuth.hasHardwareAsync()
      if (!hasBiometricHardware) return false

      // Check if the user has enrolled any authentication methods
      const hasEnrolledAuth = await LocalAuth.isEnrolledAsync()
      if (!hasEnrolledAuth) return false

      return true
    },
    default: () => Promise.resolve(false),
  })
