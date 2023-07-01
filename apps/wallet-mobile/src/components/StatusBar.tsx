import React from 'react'
import {StatusBar as NativeStatusBar} from 'react-native'

import {COLORS} from '../theme'

type Props = {
  type: 'dark' | 'light'
}

export const StatusBar = ({type}: Props) => {
  const backgroundColor = type === 'dark' ? COLORS.BACKGROUND_BLUE : COLORS.WHITE
  const barStyle = type === 'dark' ? 'light-content' : 'dark-content'

  return <NativeStatusBar barStyle={barStyle} backgroundColor={backgroundColor} />
}
