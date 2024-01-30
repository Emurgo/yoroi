import {useFocusEffect} from '@react-navigation/native'
import {Platform, StatusBar as StatusBarRN} from 'react-native'

import {COLORS} from '../theme'

type Props = {
  type: 'dark' | 'light'
  overrideColor?: string
}

export const StatusBar = ({type, overrideColor}: Props) => {
  const backgroundColor = type === 'dark' ? COLORS.WHITE : COLORS.BACKGROUND_BLUE

  useFocusEffect(() => {
    if (Platform.OS === 'android') StatusBarRN.setBackgroundColor(overrideColor ?? backgroundColor)
    StatusBarRN.setBarStyle(type === 'dark' ? 'dark-content' : 'light-content')
  })

  return null
}
