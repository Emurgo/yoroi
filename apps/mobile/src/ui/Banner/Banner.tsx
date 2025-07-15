import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Text} from '../Text/Text'

type Props = {
  text?: string
  boldText?: boolean
  label?: string
  error?: boolean
  children?: React.ReactNode
}

export const Banner = ({error, text, boldText, label, children}: Props) => {
  const {color} = useTheme()

  const bannerStyles = [
    styles.banner,
    {backgroundColor: color.gray_100},
    error === true && styles.bannerError,
    error === true && {backgroundColor: color.bg_color_max},
  ]

  return (
    <View style={bannerStyles}>
      {label != null && (
        <Text error={error} small style={styles.label}>
          {label}
        </Text>
      )}

      {text != null && (
        <Text
          small={error}
          bold={boldText}
          style={[error != null && {color: color.sys_magenta_500}]}
        >
          {text}
        </Text>
      )}

      {children}
    </View>
  )
}

type ClickableProps = {
  onPress?: () => void
} & Props

export const ClickableBanner = ({onPress, ...rest}: ClickableProps) =>
  onPress ? (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
    >
      <Banner {...rest} />
    </TouchableOpacity>
  ) : (
    <Banner {...rest} />
  )

const styles = StyleSheet.create({
  banner: {
    ...a.p_lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerError: {
    ...a.py_sm,
  },
  label: {
    marginBottom: 6,
  },
})
