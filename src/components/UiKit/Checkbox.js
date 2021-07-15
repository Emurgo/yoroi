// @flow

import React from 'react'
import {withHandlers} from 'recompose'
import {TouchableOpacity, Image} from 'react-native'

import styles from './styles/Checkbox.style'
import Text from './Text'
import checkIcon from '../../assets/img/check.png'
import checkEmptyIcon from '../../assets/img/check-empty.png'

import type {ComponentType} from 'react'
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'

type Props = {
  checked: boolean,
  text: string,
  handleChange: () => void,
  style?: ViewStyleProp,
  testID?: string,
}
const Checkbox = ({checked, text, handleChange, style, testID}: Props) => (
  <TouchableOpacity style={[styles.container, style]} onPress={handleChange} testID={testID}>
    <Image source={checked ? checkIcon : checkEmptyIcon} />
    <Text style={styles.text}>{text}</Text>
  </TouchableOpacity>
)

type ExternalProps = {
  checked: boolean,
  text: string,
  onChange: (checked: boolean) => void,
  style?: Object,
  testID?: string,
}

export default (withHandlers({
  handleChange:
    ({onChange, checked}) =>
    () =>
      onChange(!checked),
})(Checkbox): ComponentType<ExternalProps>)
