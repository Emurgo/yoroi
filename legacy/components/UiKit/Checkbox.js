// @flow

import React from 'react'
import {Image, TouchableOpacity} from 'react-native'
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'

import checkIcon from '../../assets/img/check.png'
import checkEmptyIcon from '../../assets/img/check-empty.png'
import styles from './styles/Checkbox.style'
import Text from './Text'

type Props = {
  checked: boolean,
  text: string,
  onChange: (checked: boolean) => void,
  style?: ViewStyleProp,
  testID?: string,
}
const Checkbox = ({checked, text, onChange, style, testID}: Props) => (
  <TouchableOpacity style={[styles.container, style]} onPress={() => onChange(!checked)} testID={testID}>
    <Image source={checked ? checkIcon : checkEmptyIcon} />
    <Text style={styles.text}>{text}</Text>
  </TouchableOpacity>
)

export default Checkbox
