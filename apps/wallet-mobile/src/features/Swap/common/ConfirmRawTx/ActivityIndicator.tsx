import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ActivityIndicator as RNActivityIndicator} from 'react-native'

export const ActivityIndicator = () => {
  const {isDark} = useTheme()

  return <RNActivityIndicator size="large" color={isDark ? 'white' : 'black'} />
}
