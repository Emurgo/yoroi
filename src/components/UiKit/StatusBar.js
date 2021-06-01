// @flow

import React from 'react'
import {StatusBar as NativeStatusBar} from 'react-native'

import {COLORS} from '../../styles/config'

type Props = {
  type: 'dark' | 'light',
}

const StatusBar = ({type}: Props) => {
  const backgroundColor =
    type === 'dark' ? COLORS.BACKGROUND_BLUE : COLORS.WHITE
  const barStyle = type === 'dark' ? 'light-content' : 'dark-content'

  return (
    <NativeStatusBar barStyle={barStyle} backgroundColor={backgroundColor} />
  )
}

export default StatusBar
