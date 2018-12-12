// @flow

import React from 'react'
import {StatusBar as NativeStatusBar} from 'react-native'

import {COLORS} from '../../styles/config'

import type {ComponentType} from 'react'

const StatusBar = ({type}) => {
  const backgroundColor =
    type === 'dark' ? COLORS.BACKGROUND_BLUE : COLORS.WHITE
  const barStyle = type === 'dark' ? 'light-content' : 'dark-content'

  return (
    <NativeStatusBar barStyle={barStyle} backgroundColor={backgroundColor} />
  )
}

type ExternalProps = {
  type: 'dark' | 'light',
}

export default (StatusBar: ComponentType<ExternalProps>)
