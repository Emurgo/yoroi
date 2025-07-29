import * as React from 'react'
import {Alert} from 'react-native'

import {useAuth} from '../context/AuthProvider'
import {useStrings} from './useStrings'

export const useAuthWithOs = ({
  onSuccess,
}: {
  onSuccess?: () => void
} = {}) => {
  const {loginWithHost} = useAuth()
  const strings = useStrings()

  const authWithOs = React.useCallback(async () => {
    try {
      await loginWithHost()
      onSuccess?.()
    } catch (error) {
      Alert.alert(strings.error, strings.unknownError)
    }
  }, [loginWithHost, onSuccess, strings])

  return {authWithOs}
}
