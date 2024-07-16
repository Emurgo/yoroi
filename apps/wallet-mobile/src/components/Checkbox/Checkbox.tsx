import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, TextProps, TouchableOpacity, ViewStyle} from 'react-native'

import {Icon} from '../Icon'
import {Space} from '../Space/Space'
type Props = {
  checked: boolean
  text: string
  onChange: (checked: boolean) => void
  style?: ViewStyle
  testID?: string
  textStyle?: TextProps
}
export const Checkbox = ({checked, text, onChange, style, testID, textStyle}: Props) => {
  const {styles} = useStyles()

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={() => onChange(!checked)} testID={testID}>
      {checked ? <Icon.Checkbox /> : <Icon.EmptyCheckbox />}

      <Space width="sm" />

      <Text style={[styles.text, textStyle]}>{text}</Text>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    text: {
      ...atoms.body_1_lg_regular,
      color: color.gray_c900,
    },
  })

  return {styles}
}
