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
  const {theme} = useTheme()
  const {color, padding} = theme
  const styles = StyleSheet.create({
    banner: {
      backgroundColor: color.gray[100],
      ...padding['l'],
      alignItems: 'center',
      justifyContent: 'center',
    },
    textError: {
      color: color.magenta[500],
    },
    bannerError: {
      backgroundColor: color.gray.min,
      ...padding['y-s'],
    },
    label: {
      marginBottom: 6,
    },
  })
  return styles
}
