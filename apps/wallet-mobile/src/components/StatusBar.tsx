import {StatusBar as NativeStatusBar} from 'expo-status-bar'
import React from 'react'

import {COLORS} from '../theme'

type Props = {
  type: 'dark' | 'light'
  overrideColor?: string
}

export const StatusBar = ({type, overrideColor}: Props) => {
  const backgroundColor = type === 'dark' ? COLORS.WHITE : COLORS.BACKGROUND_BLUE

  return <NativeStatusBar style={type} backgroundColor={overrideColor ?? backgroundColor} />
}
