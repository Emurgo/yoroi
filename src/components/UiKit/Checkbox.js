// @flow

import React from 'react'
import {withHandlers} from 'recompose'
import {TouchableOpacity, Image} from 'react-native'

import styles from './styles/Checkbox.style'
import Text from './Text'
import checkIcon from '../../assets/img/check.png'
import checkEmptyIcon from '../../assets/img/check-empty.png'

import type {ComponentType} from 'react'

const Checkbox = ({checked, text, handleChange, style}) => (
  <TouchableOpacity style={[styles.container, style]} onPress={handleChange}>
    <Image source={checked ? checkIcon : checkEmptyIcon} />
    <Text style={styles.text}>{text}</Text>
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
