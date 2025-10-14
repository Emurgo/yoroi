import {atoms as a, useTheme} from '@yoroi/theme'

import * as Haptics from 'expo-haptics'
import * as React from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  TextProps,
  View,
  ViewStyle,
} from 'react-native'

import {Icon} from '~/ui/Icon'

type Props = {
  checked: boolean
  text: string
  onChange: (checked: boolean) => void
  style?: ViewStyle
  testID?: string
  textStyle?: TextProps
}
export const Checkbox = ({
  checked,
  text,
  onChange,
  style,
  testID,
  textStyle,
}: Props) => {
  const {atoms: ta} = useTheme()

  return (
    <Pressable
      style={StyleSheet.flatten([
        a.flex_row,
        a.align_start,
        a.justify_start,
        a.gap_sm,
        style,
      ])}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onChange(!checked)
      }}
      testID={testID}
    >
      <View style={a.py_xs}>
        {checked ? <Icon.Checkbox /> : <Icon.EmptyCheckbox />}
      </View>

      <Text
        style={StyleSheet.flatten([
          a.flex_1,
          a.body_1_lg_regular,
          ta.text_gray_max,
          textStyle,
        ])}
      >
        {text}
      </Text>
    </Pressable>
  )
}
