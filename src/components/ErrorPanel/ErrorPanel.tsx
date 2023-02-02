import * as React from 'react'
import {StyleSheet, TextProps, View, ViewStyle} from 'react-native'

import {COLORS} from '../../theme'
import {Icon} from '../Icon'
import {Spacer} from '../Spacer'
import {Text} from '../Text'

type Props = {
  message: string
  style?: ViewStyle
}

export const ErrorPanel = ({message, style}: Props) => {
  return (
    <View style={[styles.container, style]}>
      <Icon.Info color={COLORS.ERROR_TEXT_COLOR} />

      <Spacer height={10} />

      <Message>{message}</Message>
    </View>
  )
}

const Message = ({style, ...props}: TextProps) => <Text {...props} style={[styles.message, style]} />

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND_LIGHT_RED,
    borderRadius: 8,
    flexDirection: 'column',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  message: {
    color: COLORS.ERROR_TEXT_COLOR,
    lineHeight: 22,
  },
})
