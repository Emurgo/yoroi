import * as React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {COLORS} from '../../theme'
import {Text} from '../Text'

type Props = {
  text?: string
  boldText?: boolean
  label?: string
  error?: boolean
}

export const Banner: React.FC<Props> = ({error, text, boldText, label, children}) => (
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

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.BANNER_GREY,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textError: {
    color: COLORS.ERROR_TEXT_COLOR,
  },
  bannerError: {
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  label: {
    marginBottom: 6,
  },
})
