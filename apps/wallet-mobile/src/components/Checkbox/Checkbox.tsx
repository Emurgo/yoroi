import React from 'react'
import {StyleSheet, TouchableOpacity, ViewStyle} from 'react-native'

import {Icon} from '../Icon'
import {Text} from '../Text'

type Props = {
  checked: boolean
  text: string
  onChange: (checked: boolean) => void
  style?: ViewStyle
  testID?: string
}
export const Checkbox = ({checked, text, onChange, style, testID}: Props) => (
  <TouchableOpacity style={[styles.container, style]} onPress={() => onChange(!checked)} testID={testID}>
    {checked ? <Icon.Checkbox /> : <Icon.EmptyCheckbox />}

    <Text style={styles.text}>{text}</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  text: {
    flex: 1,
    marginLeft: 8,
  },
})
