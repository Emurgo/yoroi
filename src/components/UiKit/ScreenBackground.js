// @flow

import React, {type ComponentType} from 'react'
import {View} from 'react-native'
import {type ViewProps} from 'react-native/Libraries/Components/View/ViewPropTypes'

import styles from './styles/ScreenBackground.style'

const ScreenBackground: ComponentType<ViewProps> = ({children, style}) => (
  <View style={[styles.container, style]}>{children}</View>
)

export default ScreenBackground
