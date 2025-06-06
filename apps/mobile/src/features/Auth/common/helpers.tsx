import * as LocalAuthentication from 'expo-local-authentication'

import {logger} from '../../../kernel/logger/logger'

/**
 * Checks if the device supports and is configured for OS-level authentication
 * (like Face ID, Touch ID, or other biometric authentication methods).
 *
 * @returns {Promise<boolean>} True if the device supports and is configured for OS authentication,
 *                            false otherwise or if an error occurs
 */
export const canAuthWithOS = async () => {
  try {
    // Check if the device has the necessary hardware
    const hasBiometricHardware = await LocalAuthentication.hasHardwareAsync()
    if (!hasBiometricHardware) {
      return false
    }

    // Check if the user has enrolled any authentication methods
    const hasEnrolledAuth = await LocalAuthentication.isEnrolledAsync()
    if (!hasEnrolledAuth) {
      return false
    }

    // Check if there are any supported authentication types
    const supportedAuthTypes =
      await LocalAuthentication.supportedAuthenticationTypesAsync()
    return supportedAuthTypes.length > 0
  } catch (error) {
    logger.error(error as Error, {origin: 'canAuthWithOS', type: 'error'})
    return false
  }
}
