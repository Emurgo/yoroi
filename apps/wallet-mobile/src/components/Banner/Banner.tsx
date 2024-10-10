import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Text} from '../Text'

type Props = {
  text?: string
  boldText?: boolean
  label?: string
  error?: boolean
  children?: React.ReactNode
}

export const Banner = ({error, text, boldText, label, children}: Props) => {
  const styles = useStyles()

  return (
    <View style={[styles.banner, error === true && styles.bannerError]}>
      {label != null && (
        <Text error={error} small style={styles.label}>
          {label}
        </Text>
      )}

      {text != null && (
        <Text small={error} bold={boldText} style={[error != null && styles.textError]}>
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
    <TouchableOpacity onPress={onPress} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
      <Banner {...rest} />
    </TouchableOpacity>
  ) : (
    <Banner {...rest} />
  )

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    banner: {
      backgroundColor: color.gray_100,
      ...atoms.p_lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textError: {
      color: color.sys_magenta_500,
    },
    bannerError: {
      backgroundColor: color.bg_color_max,
      ...atoms.py_sm,
    },
    label: {
      marginBottom: 6,
    },
  })
  return styles
}
