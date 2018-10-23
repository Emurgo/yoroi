import TouchID from 'react-native-touch-id'
import {Alert} from 'react-native'

const handleNotSupportedError = (error) => {
  if (error.code === 'NOT_SUPPORTED') {
    Alert.alert('Error', 'l10n Your device does not support biometry!')
  } else if (error.code === 'NOT_AVAILABLE') {
    // biometry or PIN are not set
    Alert.alert('Error', 'l10n Go to system setttings and rise your security')
  } else if (error.code === 'NOT_ENROLLED') {
    // PIN is set but biometry isn't
    Alert.alert('Error', 'l10n Go to system setttings and rise your security')
  } else {
    Alert.alert('l10n Not supported error', error.code)
  }
  return false
}

const handleAuthenticateError = (error) => {
  if (error.code === 'USER_CANCELED') {
    // this could be use to authentication using PIN on Android device
    Alert.alert('l10n Authenticate error', 'l10n User canceled authentication')
  } else if (error.code === 'AUTHENTICATION_FAILED') {
    Alert.alert('l10n Authenticate error', 'l10n Authentication failed')
  } else {
    Alert.alert('l10n Authenticate error', error.code)
  }
  return false
}

export const authenticate = () => {
  return TouchID.isSupported()
    .then(() =>
      TouchID.authenticate('l10n Authentication required', {
        title: 'l10n Authentication required', // Android title
        color: '#00f', // Android fingerprint icon color
        // Android description next to the icon
        sensorDescription: 'l10n Touch the sensor',
        // Android cancel button label
        cancelText: 'l10n Authenticate using PIN',
        fallbackLabel: '', // iOS PIN code field label
        unifiedErrors: true, // same errors codes for iOS and Android
      })
        .then(() => true)
        .catch(handleAuthenticateError),
    )
    .catch(handleNotSupportedError)
}
