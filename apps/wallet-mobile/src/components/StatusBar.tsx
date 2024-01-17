import {useTheme} from '@yoroi/theme'
import {StatusBar as NativeStatusBar} from 'expo-status-bar'
import React from 'react'

type Props = {
  type: 'dark' | 'light'
}

export const StatusBar = ({type}: Props) => {
  const {colorScheme, theme} = useTheme()
  const backgroundColor = type === 'dark' ? theme.color['white-static'] : theme.color['black-static']

  return <NativeStatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} backgroundColor={backgroundColor} />
}
