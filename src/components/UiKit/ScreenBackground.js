// @flow

import React from 'react'
import {View} from 'react-native'

import styles from './styles/ScreenBackground.style'

import type {Node, ComponentType} from 'react'

const ScreenBackground = ({children, style}) => (
  <View style={[styles.container, style]}>{children}</View>
)

type ExternalProps = {
  style?: Object,
  children: Node,
}

export default (ScreenBackground: ComponentType<ExternalProps>)
