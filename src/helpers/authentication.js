import LocalAuth from 'react-native-local-auth'
import {Alert} from 'react-native'

const handleError = (error) => {
  if (error === LocalAuth.LAErrorPasscodeNotSet) {
    Alert.alert('Yoroi Wallet',
      'Authentication could not start because the passcode is not set on the device.')
  }
  if (error === LocalAuth.RCTTouchIDNotSupported) {
    Alert.alert('Yoroi Wallet',
      'Device does not support Touch ID.')
  }
  console.log(error) // eslint-disable-line
  return false
}

export const authenticate = () => {
  return LocalAuth.authenticate(
    {
      reason: 'The reason',
      fallbackToPasscode: true,
      suppressEnterPassword: true,
    }
  )
    .then(() => true)
    .catch(handleError)
}
