import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Pressable, Text, TextProps, View, ViewStyle} from 'react-native'

import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'
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
  const {palette: p} = useTheme()

  return (
    <Pressable
      style={[
        {
          flexDirection: 'row',
          ...a.align_start,
          ...a.justify_start,
        },
        style,
      ]}
      onPress={() => onChange(!checked)}
      testID={testID}
    >
      <View style={{...a.py_xs}}>
        {checked ? <Icon.Checkbox /> : <Icon.EmptyCheckbox />}
      </View>

      <Space.Width.sm />

      <Text
        style={[
          {flex: 1, ...a.body_1_lg_regular, color: p.gray_900},
          textStyle,
        ]}
      >
        {text}
      </Text>
    </Pressable>
  )
}
