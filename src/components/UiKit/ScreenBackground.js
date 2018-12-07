// @flow

import React from 'react'
import LinearGradient from 'react-native-linear-gradient'

import {COLORS} from '../../styles/config'
import styles from './styles/ScreenBackground.style'

import type {Node, ComponentType} from 'react'

const backgroundColors = [
  COLORS.BACKGROUND_BLUE_GRADIENT_START,
  COLORS.BACKGROUND_BLUE_GRADIENT_END,
]

const ScreenBackground = ({children, style}) => (
  <LinearGradient
    style={[styles.container, style]}
    colors={backgroundColors}
    start={{x: 0, y: 0}}
    end={{x: 1, y: 1}}
  >
    {children}
  </LinearGradient>
)

type ExternalProps = {
  style?: Object,
  children: Node,
}

export default (ScreenBackground: ComponentType<ExternalProps>)
