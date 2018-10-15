import TouchID from 'react-native-touch-id'
import {Alert} from 'react-native'

const handleNotSupportedError = (error) => {
  if (error.code === 'NOT_SUPPORTED') {
    Alert.alert('Error', 'Your device does not support biometry!')
  } else if (error.code === 'NOT_AVAILABLE') {
    // biometry or PIN are not set
    Alert.alert('Error', 'Go to system setttings and rise your security')
  } else if (error.code === 'NOT_ENROLLED') {
    // PIN is set but biometry isn't
    Alert.alert('Error', 'Go to system setttings and rise your security')
  } else {
    Alert.alert('Not supported error', error.code)
  }
  return false
}

const handleAuthenticateError = (error) => {
  if (error.code === 'USER_CANCELED') {
    // this could be use to authentication using PIN on Android device
    Alert.alert('Authenticate error', 'User canceled authentication')
  } else if (error.code === 'AUTHENTICATION_FAILED') {
    Alert.alert('Authenticate error', 'Authentication failed')
  } else {
    Alert.alert('Authenticate error', error.code)
  }
  return false
}

export const authenticate = () => {
  return TouchID.isSupported()
    .then(() => TouchID.authenticate(
      'Authentication required',
      {
        title: 'Authentication required', // Android title
        color: '#00f', // Android fingerprint icon color
        sensorDescription: 'Touch the sensor', // Android description next to the icon
        cancelText: 'Authenticate using PIN', // Android cancel button label
        fallbackLabel: '', // iOS PIN code field label
        unifiedErrors: true, // same errors codes for iOS and Android
      })
      .then(() => true)
      .catch(handleAuthenticateError)
    )
    .catch(handleNotSupportedError)
}
