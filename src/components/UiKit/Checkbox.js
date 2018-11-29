// @flow

import React from 'react'
import {withHandlers} from 'recompose'
import {TouchableOpacity, View} from 'react-native'

import styles from './styles/Checkbox.style'
import Text from './Text'

import type {ComponentType} from 'react'

const Checkbox = ({checked, text, handleChange, style}) => (
  <TouchableOpacity style={[styles.container, style]} onPress={handleChange}>
    <View style={styles.checkboxContainer}>
      <Text style={styles.checkbox}>{checked ? '☑' : '☐'}</Text>
    </View>

    <View style={styles.textContainer}>
      <Text style={styles.text}>{text}</Text>
    </View>
  </TouchableOpacity>
)

type ExternalProps = {
  checked: boolean,
  text: string,
  onChange: (checked: boolean) => void,
  style?: Object,
}

export default (withHandlers({
  handleChange: ({onChange, checked}) => () => onChange(!checked),
})(Checkbox): ComponentType<ExternalProps>)
