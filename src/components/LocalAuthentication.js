import TouchID from 'react-native-touch-id'
import {Alert} from 'react-native'

const handleNotSupportedError = (error) => {
  Alert.alert('Not supported error', error.code)
  return false
}

const handleAuthenticateError = (error) => {
  Alert.alert('Authenticate error', error.code)
  return false
}

export const authenticate = () => {
  return TouchID.isSupported()
    .then(() => TouchID.authenticate(
      'Authentication required',
      {
        title: 'Authentication required',
        color: '#00f',
        sensorDescription: 'Touch the sensor',
        cancelText: 'Authenticate using PIN',
        fallbackLabel: '',
        unifiedErrors: true,
      })
      .then(() => true)
      .catch(handleAuthenticateError)
    )
    .catch(handleNotSupportedError)
}
