import {useTheme} from '@yoroi/theme'
import {StatusBar as NativeStatusBar} from 'expo-status-bar'
import React from 'react'

type Props = {
  type: 'dark' | 'light'
  overrideColor?: string
}

export const StatusBar = ({type, overrideColor}: Props) => {
  const {theme, isDark} = useTheme()
  const backgroundColor = type === 'dark' ? theme.color['white-static'] : theme.color['black-static']

  return <NativeStatusBar style={isDark ? 'light' : 'dark'} backgroundColor={overrideColor ?? backgroundColor} />
}
