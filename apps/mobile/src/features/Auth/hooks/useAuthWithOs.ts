import * as React from 'react'
import {Alert} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useAuth} from '../context/AuthProvider'

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
      Alert.alert(strings.global.error, strings.auth.unknownError)
    }
  }, [loginWithHost, onSuccess, strings])

  return {authWithOs}
}
