// @flow

import React from 'react'
import {View} from 'react-native'
import {type ViewProps} from 'react-native/Libraries/Components/View/ViewPropTypes'

import styles from './styles/ScreenBackground.style'

const ScreenBackground = ({children, style}: ViewProps) => <View style={[styles.container, style]}>{children}</View>

export default ScreenBackground
