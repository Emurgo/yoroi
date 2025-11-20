import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Pressable, Text, View, ViewProps} from 'react-native'

import {Backspace} from './Icon/Backspace'

export const BACKSPACE = 'BACKSPACE'

export const NumericKeyboard = ({
  onKeyDown,
}: {
  onKeyDown: (key: string) => void
}) => {
  const {atoms: ta} = useTheme()
  return (
    <View style={[ta.bg_color_max, {height: 248.5}]}>
      <Row>
        <Key value="1" onPress={onKeyDown} />
        <Key value="2" onPress={onKeyDown} />
        <Key value="3" onPress={onKeyDown} />
      </Row>

      <Row>
        <Key value="4" onPress={onKeyDown} />
        <Key value="5" onPress={onKeyDown} />
        <Key value="6" onPress={onKeyDown} />
      </Row>

      <Row>
        <Key value="7" onPress={onKeyDown} />
        <Key value="8" onPress={onKeyDown} />
        <Key value="9" onPress={onKeyDown} />
      </Row>

      <Row>
        <EmptyKey />
        <Key value="0" onPress={onKeyDown} />
        <BackspaceKey onPress={onKeyDown} />
      </Row>
    </View>
  )
}

type KeyboardKeyProps = {
  value: string
  onPress: (value: string) => void
}
const Key = ({value, onPress}: KeyboardKeyProps) => {
  const {palette: p, atoms: ta} = useTheme()
  return (
    <Pressable
      style={({pressed}) => [
        a.flex_1,
        a.align_center,
        a.justify_center,
        a.border_t,
        a.border_l,
        a.border_r,
        ta.bg_color_max,
        {borderColor: p.el_gray_min},
        pressed && {backgroundColor: p.bg_color_min},
      ]}
      onPress={() => onPress(value)}
      testID={`pinKey${value}`}
    >
      <Text
        style={[
          a.text_center,
          ta.text_gray_max,
          {fontSize: 30, lineHeight: 35},
        ]}
      >
        {value}
      </Text>
    </Pressable>
  )
}

const EmptyKey = () => {
  const {palette: p, atoms: ta} = useTheme()
  return (
    <View
      style={[
        a.flex_1,
        a.align_center,
        a.justify_center,
        a.border_t,
        a.border_l,
        a.border_r,
        ta.bg_color_max,
        {borderColor: p.el_gray_min},
        {backgroundColor: p.gray_300},
      ]}
      testID="pinKeyEmpty"
    />
  )
}

const BackspaceKey = ({onPress}: {onPress: (value: string) => void}) => {
  const {palette: p, atoms: ta} = useTheme()
  return (
    <Pressable
      style={({pressed}) => [
        a.flex_1,
        a.align_center,
        a.justify_center,
        a.border_t,
        a.border_l,
        a.border_r,
        ta.bg_color_max,
        {borderColor: p.el_gray_min},
        {backgroundColor: p.gray_300},
        pressed && {backgroundColor: p.bg_color_min},
      ]}
      onPress={() => onPress('BACKSPACE')}
      testID="pinKeyBACKSPACE"
    >
      <Backspace color={p.gray_max} />
    </Pressable>
  )
}

const Row = (props: ViewProps) => {
  return <View {...props} style={[a.flex_row, a.flex_1]} />
}
