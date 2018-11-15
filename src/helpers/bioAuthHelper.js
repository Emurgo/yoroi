// @flow

import TouchID from 'react-native-touch-id'
import {Alert} from 'react-native'

import l10n from '../l10n'

const handleNotSupportedError = (error) => {
  const translations = l10n.translations.BiometryAuth
  if (error.code === 'NOT_SUPPORTED') {
    Alert.alert(
      translations.errorDialogTitle,
      translations.NotSupportedErrors.deviceNotSupported,
    )
  } else if (error.code === 'NOT_AVAILABLE') {
    // biometry or PIN are not set
    Alert.alert(
      translations.errorDialogTitle,
      translations.NotSupportedErrors.biometryOrPinNotSet,
    )
  } else if (error.code === 'NOT_ENROLLED') {
    // PIN is set but biometry isn't
    Alert.alert(
      translations.errorDialogTitle,
      translations.NotSupportedErrors.pinSetButBiometryNot,
    )
  } else {
    Alert.alert(translations.NotSupportedErrors.notSupported, error.code)
  }
  return false
}

const handleAuthenticateError = (error) => {
  const translations = l10n.translations.BiometryAuth
  if (error.code === 'USER_CANCELED') {
    // this could be use to authentication using PIN on Android device
    Alert.alert(
      translations.AuthenticateErrors.text,
      translations.AuthenticateErrors.canceled,
    )
  } else if (error.code === 'AUTHENTICATION_FAILED') {
    Alert.alert(
      translations.AuthenticateErrors.text,
      translations.AuthenticateErrors.failed,
    )
  } else {
    Alert.alert(translations.AuthenticateErrors.text, error.code)
  }
  return false
}

export const authenticate = () => {
  const translations = l10n.translations.BiometryAuth
  return TouchID.isSupported()
    .then(() =>
      TouchID.authenticate(
        translations.Authentication.authenticationRequiredTitle,
        {
          // Android title
          title: translations.Authentication.authenticationRequiredTitle,
          color: '#00f', // Android fingerprint icon color
          // Android description next to the icon
          sensorDescription: translations.Authentication.touchInstructions,
          // Android cancel button label
          cancelText: translations.Authentication.withPin,
          // iOS PIN code field label
          fallbackLabel: translations.Authentication.pinCodeLabel,
          unifiedErrors: true, // same errors codes for iOS and Android
        },
      )
        .then(() => true)
        .catch(handleAuthenticateError),
    )
    .catch(handleNotSupportedError)
}
