import {StatusBar as NativeStatusBar} from 'expo-status-bar'
import React from 'react'

import {COLORS} from '../theme'

type Props = {
  type: 'dark' | 'light'
}

export const StatusBar = ({type}: Props) => {
  const backgroundColor = type === 'dark' ? COLORS.BACKGROUND_BLUE : COLORS.WHITE

  return <NativeStatusBar style={type} backgroundColor={backgroundColor} />
}
